/*jslint bitwise: true*/
define([
  'dojo/_base/declare',
  'jimu/BaseWidget',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleFillSymbol',
  'esri/Color',
  'esri/graphic',
  'esri/toolbars/edit',
  'esri/toolbars/draw',
  'dojo/on',
  'dojo/dom',
  'dojo/_base/event',
  'dojo/_base/lang',
  'esri/geometry/webMercatorUtils',
  'esri/geometry/geometryEngine',
  'esri/geometry/Polyline'
], function (
  declare,
  BaseWidget,
  EsriSimpleLineSymbol,
  EsriSimpleFillSymbol,
  EsriColor,
  EsriGraphic,
  EsriEditToolBar,
  EsriDrawToolBar,
  on,
  dom,
  event,
  dojoLang,
  webMercatorUtils,
  geometryEngine,
  EsriPolyline
) {
  return declare([BaseWidget], {
    baseClass: 'ship-widget',

    /*
     * widget constructor
     */
    constructor: function () {
       console.log('Widget Constructor');
    },

    /*
     * Widget Created
     */
    postCreate: function() {
      this.inherited(arguments);
      console.log('ShipWidget::postCreate');

      // get this from config
      this._fillSymbol = new EsriSimpleFillSymbol(
        EsriSimpleFillSymbol.STYLE_SOLID,
        new EsriSimpleLineSymbol(
          EsriSimpleLineSymbol.STYLE_DASHDOT,
          new EsriColor([255, 0, 0]), 2
        ),
        new EsriColor([255, 255, 0, 0.25])
      );

      this._editToolbar = null;

      this._drawTool = null;
    },

    /*
     * app widget startup event
     */
    startup: function() {
      this.inherited(arguments);
      console.log('ShipWidget::startup');

      this.init();

    },

    /*
     * intialize the edit toolbar
     */
    activateToolbar: function (graphic) {
      var edittool = 0;
      edittool = edittool | EsriEditToolBar.ROTATE;
      edittool = edittool | EsriEditToolBar.MOVE;
      this._editToolbar.activate(edittool, graphic);
    },

    /*
     * initialize widget components
     */
    init: function () {
      // intialize edit toolbar
      this._editToolbar = new EsriEditToolBar(this.map);

      this._drawTool = new EsriDrawToolBar(this.map);

      // UI Button click event handler
      on(
        dom.byId('Ship_Manual'),
        'click',
        dojoLang.hitch(this, this.addShipButtonWasClicked)
      );

      // draw tool event handler
      this._drawTool.on(
        'activate',
        dojoLang.hitch(this, this.addGraphic)
      );

      // listen for map graphic click events
      this.map.graphics.on(
        'click',
        dojoLang.hitch(this, function (evt) {
          event.stop(evt);
          this.activateToolbar(evt.graphic);
        })
      );

      // listen for map click events
      this.map.on(
        'click',
        dojoLang.hitch(this, function (evt) {
          this._editToolbar.deactivate();
        })
      );
    },

    /*
     * kick off add ship work
     */
    addShipButtonWasClicked: function () {
      this.shipLength = dom.byId('shipLength').value;
      this.shipWidth = dom.byId('shipWidth').value;
      this.map.disableMapNavigation();
      this._drawTool.activate('freehandpolygon');
    },

    /*
     * create a line object from given points
     */
    drawLine: function (pt1, pt2) {
      var pt1Cor = [pt1[0], pt1[1]];
      var pt2Cor = [pt2[0], pt2[1]];
      var lineJSON = {
        paths: [[pt1Cor, pt2Cor]],
        spatialReference: {'wkid': 102100}
      };

      var line = new EsriPolyline(lineJSON);
      return line;
    },

    /*
     * place graphic shape on the map
     */
    addGraphic: function (evt) {
        //deactivate the toolbar and clear existing graphics
        this._drawTool.deactivate();
        this.map.enableMapNavigation();

        var centerX = this.map.extent.getCenter().x;
        var centerY = this.map.extent.getCenter().y;

        var centerline = this.drawLine([centerX ,centerY], [centerX + Number(this.shipLength), centerY]);
        var lineGeodesicLength = geometryEngine.geodesicLength(centerline, 'meters');
        var ratio = this.shipLength / lineGeodesicLength;

        var myPolygon = {
          'geometry': {
            'rings': [[
              [centerX, centerY],
              [centerX + (this.shipLength * 0.005 * ratio), centerY + (this.shipWidth * 0.088 * ratio)],
              [centerX + (this.shipLength * 0.008 * ratio), centerY + (this.shipWidth * 0.123 * ratio)],
              [centerX + (this.shipLength * 0.022 * ratio), centerY + (this.shipWidth * 0.203 * ratio)],
              [centerX + (this.shipLength * 0.045 * ratio), centerY + (this.shipWidth * 0.281 * ratio)],
              [centerX + (this.shipLength * 0.073 * ratio), centerY + (this.shipWidth * 0.357 * ratio)],
              [centerX + (this.shipLength * 0.108 * ratio), centerY + (this.shipWidth * 0.431 * ratio)],
              [centerX + (this.shipLength * 0.150 * ratio), centerY + (this.shipWidth * 0.5 * ratio)],
              [centerX + (this.shipLength * 0.99 * ratio), centerY + (this.shipWidth * 0.5 * ratio)],
              [centerX + (this.shipLength * 0.995 * ratio), centerY + (this.shipWidth * 0.35 * ratio)],
              [centerX + (this.shipLength * 1 * ratio), centerY + (this.shipWidth * 0.2 * ratio)],
              [centerX + (this.shipLength * 1 * ratio), centerY - (this.shipWidth * 0.2 * ratio)],
              [centerX + (this.shipLength * 0.995 * ratio), centerY - (this.shipWidth * 0.35 * ratio)],
              [centerX + (this.shipLength * 0.99 * ratio), centerY - (this.shipWidth * 0.5 * ratio)],
              [centerX + (this.shipLength * 0.150 * ratio), centerY - (this.shipWidth * 0.5 * ratio)],
              [centerX + (this.shipLength * 0.108 * ratio), centerY - (this.shipWidth * 0.431 * ratio)],
              [centerX + (this.shipLength * 0.073 * ratio), centerY - (this.shipWidth * 0.357 * ratio)],
              [centerX + (this.shipLength * 0.045 * ratio), centerY - (this.shipWidth * 0.281 * ratio)],
              [centerX + (this.shipLength * 0.022 * ratio), centerY - (this.shipWidth * 0.203 * ratio)],
              [centerX + (this.shipLength * 0.008 * ratio), centerY - (this.shipWidth * 0.123 * ratio)],
              [centerX + (this.shipLength * 0.005 * ratio), centerY - (this.shipWidth * 0.088 * ratio)],
              [centerX, centerY]
            ]],
            'spatialReference': {'wkid': 102100}
          },
          'symbol': {
            'color': [255, 255, 255, 64],
            'outline': {
              'color': [0, 0, 0, 255],
              'width': 1,
              'type': 'esriSLS',
              'style': 'esriSLSSolid'
            },
            'type': 'esriSFS',
            'style': 'esriSFSSolid'
          }
        };
        this.map.graphics.add(new EsriGraphic(myPolygon));
      }
  });
});
