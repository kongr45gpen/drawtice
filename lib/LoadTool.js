(function ($, BaseTool, pluginsNamespace, util) {
  var LoadTool = function LoadConstructor(drawerInstance, options) {
    var _this = this;

    BaseTool.call(_this, drawerInstance);

    this.drawer = drawerInstance;
    this.name = "Load";
    this.btnClass = "btn-image";
    this.faClass = "fa-folder-open-o";
    this.tooltip = drawerInstance.t("Load old data");
  };

  // Derive LoadTool from BaseTool
  LoadTool.prototype = Object.create(BaseTool.prototype);
  LoadTool.prototype.constructor = LoadTool;

  /**
   * Tool activation method.
   * Is called in lifecycle of event Drawer.EVENT_DO_ACTIVATE_TOOL.
   * Calls  BaseTool._activateTool .
   *
   * @private
   */
  LoadTool.prototype._activateTool = function () {
    var _this = this;
    this.drawerInstance.log("TOOL", "Load._activateTool()");
    BaseTool.prototype._activateTool.call(this);

    console.log("Loading image from Local Storage");

    _this.drawerInstance.api.loadCanvasFromData(localStorage.getItem("drawtice.canvas"));

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
    }, 700);
  };
  pluginsNamespace.Load = LoadTool;
})(jQuery, DrawerJs.plugins.BaseTool, DrawerJs.plugins, DrawerJs.util);
