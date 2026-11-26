(function (exports) {
  const toast = (t) => { try { vendetta.ui.toasts.showToast(String(t)); } catch (e) {} };
  let enabled = true;
  let unpatch = null;

  exports.onLoad = () => {
    try {
      const { findByStoreName } = vendetta.metro;
      const { before } = vendetta.patcher;
      const store = findByStoreName("GatewayConnectionStore");
      if (!store || !store.getSocket) return toast("Fake Deafen: GatewayConnectionStore not found");
      const socket = store.getSocket();
      if (!socket) return toast("Fake Deafen: no socket, restart Discord");

      const proto = Object.getPrototypeOf(socket);
      const target = proto && typeof proto.voiceStateUpdate === "function" ? proto : socket;
      if (typeof target.voiceStateUpdate !== "function")
        return toast("Fake Deafen: voiceStateUpdate not found");

      unpatch = before("voiceStateUpdate", target, (args) => {
        if (enabled && args[0] && typeof args[0] === "object") {
          args[0] = Object.assign({}, args[0], { selfDeaf: true });
          toast("Fake Deafen: sent");
        }
        return args;
      });
      toast("Fake Deafen ready");
    } catch (e) {
      toast("Fake Deafen error: " + (e && e.message ? e.message : e));
    }
  };

  exports.onUnload = () => { if (unpatch) { unpatch(); unpatch = null; } };

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
