(function (exports) {
  const toast = (t) => { try { vendetta.ui.toasts.showToast(String(t)); } catch (e) {} };
  let enabled = true;
  let unpatch = null;
  let unregister = null;

  const resend = () => {
    try {
      const A = vendetta.metro.findByProps("toggleSelfMute");
      if (A && A.toggleSelfMute) {
        A.toggleSelfMute();
        setTimeout(() => { try { A.toggleSelfMute(); } catch (e) {} }, 200);
      }
    } catch (e) {}
  };

  const setEnabled = (v) => {
    enabled = v;
    toast(v ? "Fake Deafen ON" : "Fake Deafen OFF");
    resend();
  };

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
        }
        return args;
      });

      try {
        unregister = vendetta.commands.registerCommand({
          name: "fd",
          displayName: "fd",
          description: "Toggle Fake Deafen",
          displayDescription: "Toggle Fake Deafen",
          options: [],
          applicationId: "-1",
          inputType: 1,
          type: 1,
          execute: () => { setEnabled(!enabled); },
        });
      } catch (e) {
        toast("Command not registered: " + (e && e.message ? e.message : e));
      }

      toast("Fake Deafen ready - type /fd to toggle");
    } catch (e) {
      toast("Fake Deafen error: " + (e && e.message ? e.message : e));
    }
  };

  exports.onUnload = () => {
    if (unpatch) { unpatch(); unpatch = null; }
    if (unregister) { unregister(); unregister = null; }
  };

  exports.settings = () => {
    const { React, ReactNative } = vendetta.metro.common;
    const Forms = (vendetta.ui.components && vendetta.ui.components.Forms) || {};
    const [on, setOn] = React.useState(enabled);
    if (!Forms.FormSwitchRow) return React.createElement(ReactNative.Text, null, "UI not found");
    return React.createElement(Forms.FormSwitchRow, {
      label: "Fake Deafen",
      subLabel: "Appear deafened to others (or type /fd)",
      value: on,
      onValueChange: (v) => { setOn(v); setEnabled(v); },
    });
  };
  return exports;
})({});
