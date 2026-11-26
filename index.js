(function (exports) {
  const toast = (t) => { try { vendetta.ui.toasts.showToast(String(t)); } catch (e) {} };
  let enabled = true;
  let origSend = null;

  exports.onLoad = () => {
    try {
      origSend = WebSocket.prototype.send;
      WebSocket.prototype.send = function (data) {
        try {
          if (enabled && typeof data === "string" && data.indexOf('"op":4') !== -1) {
            const j = JSON.parse(data);
            if (j && j.op === 4 && j.d && j.d.channel_id) {
              j.d.self_deaf = true;
              data = JSON.stringify(j);
              toast("Fake Deafen: sent");
            }
          }
        } catch (e) {}
        return origSend.call(this, data);
      };
      toast("Fake Deafen ready");
    } catch (e) {
      toast("Fake Deafen error: " + (e && e.message ? e.message : e));
    }
  };

  exports.onUnload = () => {
    if (origSend) { WebSocket.prototype.send = origSend; origSend = null; }
  };

  exports.settings = () => {
    const { React, ReactNative } = vendetta.metro.common;
    const Forms = (vendetta.ui.components && vendetta.ui.components.Forms) || {};
    const [on, setOn] = React.useState(enabled);
    if (!Forms.FormSwitchRow) return React.createElement(ReactNative.Text, null, "UI not found");
    return React.createElement(Forms.FormSwitchRow, {
      label: "Fake Deafen",
      subLabel: "Appear deafened to others",
      value: on,
      onValueChange: (v) => { enabled = v; setOn(v); toast(v ? "Fake Deafen ON" : "Fake Deafen OFF"); },
    });
  };
  return exports;
})({});
