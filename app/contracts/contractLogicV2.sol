// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./contracLogic.sol";

contract contractLogicV2 is contractLogic {
    struct ParticipantAddition {
        bytes32 role;
        address account;
    }

    mapping(bytes32 => mapping(bytes32 => mapping(address => bool))) private authorized;

    event ParticipantAdded(bytes32 indexed instance, bytes32 indexed role, address indexed account);

    function setChoreography(
        Activity[] memory allActivities,
        Message[] memory allMessages,
        PartecipantRoles[] memory participantList,
        MessageAttributes[] memory messagesAttributeList,
        ControlFlowElement[] memory allControlFlowElement,
        EdgeCondition[] memory edgeCondition,
        bytes32 idInstance,
        bytes32 hashIdInstance
    ) public override {
        super.setChoreography(
            allActivities,
            allMessages,
            participantList,
            messagesAttributeList,
            allControlFlowElement,
            edgeCondition,
            idInstance,
            hashIdInstance
        );
        _registerParticipants(hashIdInstance, participantList);
    }

    function executeMessage(
        Activity memory activity,
        Message memory message,
        ControlFlowElement[] memory currentControlFlowElement,
        bytes32[] memory attributes,
        bytes32[] memory values,
        Activity[] memory activityList,
        ControlFlowElement[] memory controlFlowElementList,
        EdgeCondition[] memory edgeConditionList,
        Message[] memory messageList,
        bytes32 hashInstance
    ) public override {
        ParticipantAddition[] memory noAdditions = new ParticipantAddition[](0);
        _executeAuthorizedMessage(
            activity,
            message,
            currentControlFlowElement,
            attributes,
            values,
            activityList,
            controlFlowElementList,
            edgeConditionList,
            messageList,
            hashInstance,
            noAdditions
        );
    }

    function executeMessageWithParticipants(
        Activity memory activity,
        Message memory message,
        ControlFlowElement[] memory currentControlFlowElement,
        bytes32[] memory attributes,
        bytes32[] memory values,
        Activity[] memory activityList,
        ControlFlowElement[] memory controlFlowElementList,
        EdgeCondition[] memory edgeConditionList,
        Message[] memory messageList,
        bytes32 hashInstance,
        ParticipantAddition[] memory additions
    ) public {
        _executeAuthorizedMessage(
            activity,
            message,
            currentControlFlowElement,
            attributes,
            values,
            activityList,
            controlFlowElementList,
            edgeConditionList,
            messageList,
            hashInstance,
            additions
        );
    }

    function isParticipantAuthorized(bytes32 hashInstance, bytes32 role, address account)
        external
        view
        returns (bool)
    {
        return authorized[hashInstance][role][account];
    }

    function _executeAuthorizedMessage(
        Activity memory activity,
        Message memory message,
        ControlFlowElement[] memory currentControlFlowElement,
        bytes32[] memory attributes,
        bytes32[] memory values,
        Activity[] memory activityList,
        ControlFlowElement[] memory controlFlowElementList,
        EdgeCondition[] memory edgeConditionList,
        Message[] memory messageList,
        bytes32 hashInstance,
        ParticipantAddition[] memory additions
    ) private {
        require(instancies[hashInstance].initialized, "Unknown instance");

        Activity storage modelActivity = instancies[hashInstance].activities[message.idActivity];
        require(modelActivity.id != bytes32(0), "Unknown activity");
        require(
            activity.id == modelActivity.id &&
            activity.name == modelActivity.name &&
            activity.initiator == modelActivity.initiator &&
            activity.target == modelActivity.target &&
            activity.messageIn == modelActivity.messageIn &&
            activity.messageOut == modelActivity.messageOut &&
            activity.idInElement == modelActivity.idInElement &&
            activity.idOutElement == modelActivity.idOutElement,
            "Activity does not match the model"
        );
        require(
            message.idActivity == modelActivity.id &&
            (message.id == modelActivity.messageIn || message.id == modelActivity.messageOut),
            "Message does not match the model"
        );

        Message storage modelMessage = instancies[hashInstance].messages[message.id];
        require(
            modelMessage.id != bytes32(0) &&
            modelMessage.idActivity == message.idActivity &&
            (modelMessage.mappingKey == bytes32(0) ||
                modelMessage.mappingKey == message.mappingKey),
            "Message data does not match the model"
        );
        if (message.id == modelActivity.messageIn) {
            require(
                msg.sender == message.sourceParticipant &&
                authorized[hashInstance][modelActivity.initiator][msg.sender],
                "Caller is not the authorized sender for this message"
            );
        } else {
            require(
                message.id == modelActivity.messageOut,
                "Message has no authorized participant role"
            );
            require(
                msg.sender == message.targetParticipant &&
                authorized[hashInstance][modelActivity.target][msg.sender],
                "Caller is not the authorized recipient for this message"
            );
        }
        require(
            authorized[hashInstance][modelActivity.initiator][message.sourceParticipant] ||
            _includedInAdditions(additions, modelActivity.initiator, message.sourceParticipant),
            "Unauthorized message sender"
        );
        require(
            authorized[hashInstance][modelActivity.target][message.targetParticipant] ||
            _includedInAdditions(additions, modelActivity.target, message.targetParticipant),
            "Unauthorized message recipient"
        );

        _validateRuntimeActivities(activityList, hashInstance);
        _validateRuntimeMessages(messageList, hashInstance);

        // The caller is checked against existing permissions before additions are applied.
        _registerAdditions(hashInstance, additions);
        _executeMessage(
            activity,
            message,
            currentControlFlowElement,
            attributes,
            values,
            activityList,
            controlFlowElementList,
            edgeConditionList,
            messageList,
            hashInstance
        );
    }

    function _validateRuntimeActivities(Activity[] memory activityList, bytes32 hashInstance)
        private
        view
    {
        for (uint i = 0; i < activityList.length; i++) {
            Activity storage modelActivity = instancies[hashInstance].activities[activityList[i].id];
            require(
                modelActivity.id != bytes32(0) &&
                modelActivity.name == activityList[i].name &&
                modelActivity.idInElement == activityList[i].idInElement &&
                modelActivity.idOutElement == activityList[i].idOutElement &&
                modelActivity.initiator == activityList[i].initiator &&
                modelActivity.target == activityList[i].target &&
                modelActivity.messageIn == activityList[i].messageIn &&
                modelActivity.messageOut == activityList[i].messageOut,
                "Runtime activity does not match the model"
            );
        }
    }

    function _validateRuntimeMessages(Message[] memory messageList, bytes32 hashInstance)
        private
        view
    {
        for (uint i = 0; i < messageList.length; i++) {
            Message storage modelMessage = instancies[hashInstance].messages[messageList[i].id];
            require(
                modelMessage.id != bytes32(0) &&
                modelMessage.idActivity == messageList[i].idActivity &&
                (modelMessage.mappingKey == bytes32(0) ||
                    modelMessage.mappingKey == messageList[i].mappingKey) &&
                modelMessage.name == messageList[i].name,
                "Runtime message does not match the model"
            );
        }
    }

    function _registerParticipants(
        bytes32 hashInstance,
        PartecipantRoles[] memory participantList
    ) private {
        for (uint i = 0; i < participantList.length; i++) {
            bytes32 role = participantList[i].keyMapping;
            address[] memory accounts = participantList[i].addr;
            for (uint j = 0; j < accounts.length; j++) {
                require(accounts[j] != address(0), "Zero participant address");
                if (!authorized[hashInstance][role][accounts[j]]) {
                    authorized[hashInstance][role][accounts[j]] = true;
                    emit ParticipantAdded(hashInstance, role, accounts[j]);
                }
            }
        }
    }

    function _registerAdditions(bytes32 hashInstance, ParticipantAddition[] memory additions)
        private
    {
        for (uint i = 0; i < additions.length; i++) {
            address account = additions[i].account;
            require(account != address(0), "Zero participant address");

            bytes32 role = additions[i].role;
            if (!authorized[hashInstance][role][account]) {
                authorized[hashInstance][role][account] = true;
                instancies[hashInstance].participants[role].push(account);
                emit ParticipantAdded(hashInstance, role, account);
            }
        }
    }

    function _includedInAdditions(
        ParticipantAddition[] memory additions,
        bytes32 role,
        address account
    ) private pure returns (bool) {
        for (uint i = 0; i < additions.length; i++) {
            if (additions[i].role == role && additions[i].account == account) {
                return true;
            }
        }
        return false;
    }
}
