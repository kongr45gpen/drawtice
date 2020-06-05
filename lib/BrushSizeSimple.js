(function ($, pluginsNamespace, BaseToolOptions) {
  'use strict';

  /**
   * Provides range control for selecting brush size in free drawing mode.
   *
   * @param {DrawerJs.Drawer} drawer
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var BrushSizeSimple = function BrushSizeConstructor(drawer) {
    // call super constructor
    BaseToolOptions.call(this, drawer);

    this.name = 'BrushSizeSimple';

    /**
     * Option name. On selecting tool/object, if this.toolName is in array of
     * object allowed options - tool will show controls
     * @type {String}
     */
    this.optionName = 'brushSize';

    /**
     * Size controls element
     * @type {Object}
     */
    this.$sizeControl = null;

    // set handlers
    drawer.on(drawer.EVENT_BRUSH_SIZE_CHANGED, this.updateValue.bind(this));
    drawer.on(drawer.EVENT_BRUSH_CHANGED, this.updateValue.bind(this));
  };


  BrushSizeSimple.prototype = Object.create(BaseToolOptions.prototype);
  BrushSizeSimple.prototype.constructor = BaseToolOptions;


//////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Creates controls. Is called from BaseToolOptions._onToolbarCreated
     * @param  {DrawerToolbar} toolbar
     */
    BrushSizeSimple.prototype.createControls = function(toolbar) {
        this.createSizeControl(toolbar);
    };

    /**
     * Deletes tool button.
     * If  doDeleteToolbarCreationListeners is true - removes listenin on toolbar creation event.
     * So, tool will not appear on toolbar next time, when toolbar is created.
     *
     * @param {boolean} doDeleteToolbarCreationListeners
     */
    BrushSizeSimple.prototype.removeTool = function(doDeleteToolbarCreationListeners) {
        this.$sizeControl.remove();

        // stop listening toolbar creation
        if (doDeleteToolbarCreationListeners) {
            this.drawer.off(this.drawer.EVENT_OPTIONS_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
        }
    };


  /**
   * Create controls.
   * @param  {DrawerToolbar} toolbar to add control to
   */
  BrushSizeSimple.prototype.createSizeControl = function (toolbar) {
    var _this = this;

    console.log("helloooo")

    _this.$sizeControl = $(
      '<li style="display:none" ' +
          'class="editable-canvas-brushsize toolbar-item-range"' +
      '>' +
        '<div class="toolbar-item-description">' +
          '<span class="toolbar-label">' +
          'Size:' + ' ' +
          '</span>' +
        '</div>' +
        '<div class="drawing-size-buttons pure-button-group" role="group" aria-label="Brush sizes">' +
          '<button class="pure-button" value="2" title="small"><i class="fa fa-circle"></i></button>' +
          '<button class="pure-button" value="6" title="medium"><i class="fa fa-circle"></i></button>' +
          '<button class="pure-button" value="10" title="large"><i class="fa fa-circle"></i></button>' +
          '<button class="pure-button" value="30" title="huge"><i class="fa fa-circle"></i></button>' +
        '</div>' +
        '</li>');

    toolbar.addControl(_this.$sizeControl, 10);

    $(_this.$sizeControl).on('click', function (e) {
      var $button = e.target;
      if ($button.value !== undefined) {
        _this.drawer.setBrushSize($button.value);

        _this.$sizeControl.get()[0].querySelectorAll('button').forEach(function(el) {
          el.classList.remove('pure-button-active');
        });
        $button.classList.add('pure-button-active');
      }
    });
  };


  BrushSizeSimple.prototype.showControls = function() {
      this.updateValue();
      this.$sizeControl.show();
  };

  BrushSizeSimple.prototype.hideControls = function() {
      this.$sizeControl.hide();
  };


  /**
   * Update size control with current drawer brush size.
   */
  BrushSizeSimple.prototype.updateValue = function () {
    var size = this.drawer.getBrushSize();

    this.$sizeControl.find('button').removeClass('pure-button-active');
    this.$sizeControl.find('button[value=' + size + ']').addClass('pure-button-active');
  };

  pluginsNamespace.BrushSizeSimple = BrushSizeSimple;

}(jQuery, DrawerJs.plugins, DrawerJs.plugins.BaseToolOptions));
