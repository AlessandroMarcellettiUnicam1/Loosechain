export default function notify(message, type = 'info') {
  window.dispatchEvent(new CustomEvent('loosechain:notification', {
    detail: { type, message }
  }));
}
