const assert = require('node:assert/strict');
const { ethers } = require('hardhat');

describe('contractLogicV2', function() {
  it('authorizes the executing participant and registers additions atomically', async function() {
    const [sender, recipient, outsider, addedParticipant] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('contractLogicV2');
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const roleSender = ethers.encodeBytes32String('sender-role');
    const roleRecipient = ethers.encodeBytes32String('recipient-role');
    const taskId = ethers.encodeBytes32String('task');
    const messageId = ethers.encodeBytes32String('message');
    const startId = ethers.encodeBytes32String('start');
    const attributeKey = ethers.encodeBytes32String('attributes');
    const choreographyId = ethers.encodeBytes32String('choreography');
    const instanceId = ethers.encodeBytes32String('instance');
    const zero = ethers.ZeroHash;

    const activity = {
      executed: false,
      id: taskId,
      idInElement: startId,
      idOutElement: zero,
      initiator: roleSender,
      messageIn: messageId,
      messageOut: zero,
      name: taskId,
      target: roleRecipient,
      tempState: false
    };
    const message = {
      executed: false,
      id: messageId,
      idActivity: taskId,
      mappingKey: zero,
      name: messageId,
      selectedAttr: [],
      sourceParticipant: sender.address,
      targetParticipant: addedParticipant.address,
      tempState: false
    };
    const startElement = {
      executed: false,
      id: startId,
      incomingActivity: [],
      outgoingActivity: [taskId],
      elementType: 1
    };
    const runtimeMessage = { ...message, mappingKey: attributeKey };

    await contract.setChoreography(
      [activity],
      [message],
      [
        { addr: [sender.address], keyMapping: roleSender },
        { addr: [recipient.address], keyMapping: roleRecipient }
      ],
      [{ attributes: [attributeKey], keyMapping: attributeKey }],
      [startElement],
      [],
      choreographyId,
      instanceId
    );

    const executionArgs = [
      activity,
      runtimeMessage,
      [startElement],
      [],
      [],
      [],
      [],
      [],
      [],
      instanceId
    ];
    const additions = [{ role: roleRecipient, account: addedParticipant.address }];

    await assert.rejects(
      contract.connect(outsider).executeMessageWithParticipants.staticCall(
        ...executionArgs,
        additions
      ),
      /Caller is not the authorized sender for this message/
    );
    await assert.rejects(
      contract.connect(recipient).executeMessageWithParticipants.staticCall(
        ...executionArgs,
        additions
      ),
      /Caller is not the authorized sender for this message/
    );
    assert.equal(
      await contract.isParticipantAuthorized(instanceId, roleRecipient, addedParticipant.address),
      false
    );

    const invalidExecutionArgs = [...executionArgs];
    invalidExecutionArgs[3] = [attributeKey];
    await assert.rejects(async () => {
      const transaction = await contract.connect(sender).executeMessageWithParticipants(
        ...invalidExecutionArgs,
        additions,
        { gasLimit: 3000000 }
      );
      await transaction.wait();
    });
    assert.equal(
      await contract.isParticipantAuthorized(instanceId, roleRecipient, addedParticipant.address),
      false
    );

    await contract.connect(sender).executeMessageWithParticipants(
      ...executionArgs,
      additions
    );

    assert.equal(
      await contract.isParticipantAuthorized(instanceId, roleRecipient, addedParticipant.address),
      true
    );
    const storedMessage = await contract.getMessage(instanceId, messageId);
    assert.equal(storedMessage.executed, true);
  });
});
