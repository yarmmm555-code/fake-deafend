(function (exports) {
  const { findByProps } = vendetta.metro;
  const { before } = vendetta.patcher;
  const toast = (t) => { try { vendetta.ui.toasts.showToast(String(t)); } catch (e) {} };

  let enabled = true;
  let unpatches = [];

  exports.onLoad = () => {
    try {
      const mod = findByProps("voiceStateUpdate");
      if (!mod) return toast("Fake Deafen: module not found");
      unpatches.push(
        before("voiceStateUpdate", mod, (args) => {
          if (enabled && args[0] && typeof args[0] === "object") {
            args[0].selfDeaf = true;
          }
        })
      );
      toast("Fake Deafen ready");
    } catch (e) {
      toast("Fake Deafen error: " + (e && e.message ? e.message : e));
    }
  };

  exports.onUnload = () => { unpatches.forEach((u) => u()); unpatches = []; };

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
