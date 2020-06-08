(function ($, BaseTool, pluginsNamespace, util) {
  var ClearTool = function ClearConstructor(drawerInstance, options) {
    var _this = this;

    BaseTool.call(_this, drawerInstance);

    this.drawer = drawerInstance;
    this.name = "Clear";
    this.btnClass = "btn-clear";
    this.faClass = "fa-times-circle";
    this.tooltip = drawerInstance.t("Clear the ENTIRE image");
  };

  // Derive ClearTool from BaseTool
  ClearTool.prototype = Object.create(BaseTool.prototype);
  ClearTool.prototype.constructor = ClearTool;

  /**
   * Tool activation method.
   * Is called in lifecycle of event Drawer.EVENT_DO_ACTIVATE_TOOL.
   * Calls  BaseTool._activateTool .
   *
   * @private
   */
  ClearTool.prototype._activateTool = function () {
    var _this = this;
    this.drawerInstance.log("TOOL", "Clear._activateTool()");
    BaseTool.prototype._activateTool.call(this);

    this.drawer.api.loadCanvasFromData({
      objects: [],
      background: ""
    });

    // deactivate tool. Slight delay is needed, because without it
    // tool is deactivated before listeners on EVENT_DO_ACTIVATE_TOOL in drawer are executed
    // which lead to incorrect way of setting drawer.lastUsedPluginName
    util.setTimeout(function () {
      _this.drawerInstance.trigger(
        _this.drawerInstance.EVENT_DO_DEACTIVATE_TOOL,
        [_this]
      );
      _this.drawerInstance.trigger(
        _this.drawerInstance.EVENT_HIDE_TOOLTIPS,
        [_this]
      );
    }, 300);
  };
  pluginsNamespace.Clear = ClearTool;
})(jQuery, DrawerJs.plugins.BaseTool, DrawerJs.plugins, DrawerJs.util);
