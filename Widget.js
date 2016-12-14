define(['dojo/_base/declare', 'jimu/BaseWidget', 'esri/symbols/SimpleLineSymbol', 'esri/symbols/SimpleFillSymbol', 'esri/Color',
            'esri/graphic', 'esri/toolbars/edit', 'esri/toolbars/draw', 'dojo/on', 'dojo/dom', 'dojo/_base/event', 'esri/geometry/webMercatorUtils', 'esri/geometry/geometryEngine', 'esri/geometry/Polyline'
        ],
        function(declare, BaseWidget, SimpleLineSymbol, SimpleFillSymbol, Color, Graphic, Edit, Draw, on, dom, event, webMercatorUtils, geometryEngine, polyline) {
            //To create a widget, you need to derive from BaseWidget.
            return declare([BaseWidget], {

                // Custom widget code goes here

                baseClass: 'ship-widget',
                // this property is set by the framework when widget is loaded.
                // name: 'ShipWidget',
                // add additional properties here

                //methods to communication with app container:
                postCreate: function() {
                    this.inherited(arguments);
                    console.log('ShipWidget::postCreate');
                },

                startup: function() {
                    this.inherited(arguments);
                    console.log('ShipWidget::startup');

                    var self = this;
                    initEditing();
                    initToolbar();

                    function initEditing() {
                        editToolbar = new Edit(self.map);
                        self.map.graphics.on("click", function(evt) {
                            event.stop(evt);
                            activateToolbar(evt.graphic);
                        });

                        self.map.on("click", function(evt) {
                            editToolbar.deactivate();
                        });
                    }

                    function activateToolbar(graphic) {
                        var edittool = 0;
                        edittool = edittool | Edit.ROTATE;
                        edittool = edittool | Edit.MOVE;
                        editToolbar.activate(edittool, graphic);
                    }

                    var fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
                            new Color([255, 0, 0]), 2), new Color([255, 255, 0, 0.25])
                    );

                    function initToolbar() {
                        tb = new Draw(self.map);
                        tb.on("activate", addGraphic);

                        // event delegation so a click handler is not
                        // needed for each individual button
                        on(dom.byId("Ship_Manual"), "click", function(evt) {
                            self.shipLength = dom.byId("shipLength").value;
                            self.shipWidth = dom.byId("shipWidth").value;
                            self.map.disableMapNavigation();
                            tb.activate("freehandpolygon");
                        });                                                                  
                    }

					function drawLine(pt1, pt2){
						var pt1Cor = [pt1[0], pt1[1]];
						var pt2Cor = [pt2[0], pt2[1]];
						var lineJSON = {
							paths: [[pt1Cor, pt2Cor]],
							spatialReference: {
                                    "wkid": 102100
                                }
						};
						var line = new polyline(lineJSON);
						return line;
					  }
					
                    function addGraphic(evt) {
                        //deactivate the toolbar and clear existing graphics 
                        tb.deactivate();
                        self.map.enableMapNavigation();

                        var symbol;
                        symbol = fillSymbol;

                        var centerX = self.map.extent.getCenter().x;
                        var centerY = self.map.extent.getCenter().y;
						
						var centerline = drawLine([centerX,centerY],[centerX + Number(self.shipLength),centerY]);
						var lineGeodesicLength = geometryEngine.geodesicLength(centerline, "meters");  
						var ratio = self.shipLength / lineGeodesicLength;
						
                        var myPolygon = {
                            "geometry": {
                                "rings": [
                                    [
                                        [centerX, centerY],
                                        [centerX + (self.shipLength * 0.005 * ratio), centerY + (self.shipWidth * 0.088 * ratio)],
                                        [centerX + (self.shipLength * 0.008 * ratio), centerY + (self.shipWidth * 0.123 * ratio)],
                                        [centerX + (self.shipLength * 0.022 * ratio), centerY + (self.shipWidth * 0.203 * ratio)],
                                        [centerX + (self.shipLength * 0.045 * ratio), centerY + (self.shipWidth * 0.281 * ratio)],
                                        [centerX + (self.shipLength * 0.073 * ratio), centerY + (self.shipWidth * 0.357 * ratio)],
                                        [centerX + (self.shipLength * 0.108 * ratio), centerY + (self.shipWidth * 0.431 * ratio)],
                                        [centerX + (self.shipLength * 0.150 * ratio), centerY + (self.shipWidth * 0.5 * ratio)],
                                        [centerX + (self.shipLength * 0.99 * ratio), centerY + (self.shipWidth * 0.5 * ratio)],
										[centerX + (self.shipLength * 0.995 * ratio), centerY + (self.shipWidth * 0.35 * ratio)],
                                        [centerX + (self.shipLength * 1 * ratio), centerY + (self.shipWidth * 0.2 * ratio)],
                                        [centerX + (self.shipLength * 1 * ratio), centerY - (self.shipWidth * 0.2 * ratio)],
										[centerX + (self.shipLength * 0.995 * ratio), centerY - (self.shipWidth * 0.35 * ratio)],
                                        [centerX + (self.shipLength * 0.99 * ratio), centerY - (self.shipWidth * 0.5 * ratio)],
                                        [centerX + (self.shipLength * 0.150 * ratio), centerY - (self.shipWidth * 0.5 * ratio)],
                                        [centerX + (self.shipLength * 0.108 * ratio), centerY - (self.shipWidth * 0.431 * ratio)],
                                        [centerX + (self.shipLength * 0.073 * ratio), centerY - (self.shipWidth * 0.357 * ratio)],
                                        [centerX + (self.shipLength * 0.045 * ratio), centerY - (self.shipWidth * 0.281 * ratio)],
                                        [centerX + (self.shipLength * 0.022 * ratio), centerY - (self.shipWidth * 0.203 * ratio)],
                                        [centerX + (self.shipLength * 0.008 * ratio), centerY - (self.shipWidth * 0.123 * ratio)],
                                        [centerX + (self.shipLength * 0.005 * ratio), centerY - (self.shipWidth * 0.088 * ratio)],
                                        [centerX, centerY],
                                    ]
                                ],
                                "spatialReference": {
                                    "wkid": 102100
                                }
                            },
                            "symbol": {
                                "color": [255, 255, 255, 64],
                                "outline": {
                                    "color": [0, 0, 0, 255],
                                    "width": 1,
                                    "type": "esriSLS",
                                    "style": "esriSLSSolid"
                                },
                                "type": "esriSFS",
                                "style": "esriSFSSolid"
                            }
                        };
                   
                                    self.map.graphics.add(new Graphic(myPolygon));
                                }
                            },

                            // onOpen: function(){
                            //   console.log('ShipWidget::onOpen');
                            // },

                            // onClose: function(){
                            //   console.log('ShipWidget::onClose');
                            // },

                            // onMinimize: function(){
                            //   console.log('ShipWidget::onMinimize');
                            // },

                            // onMaximize: function(){
                            //   console.log('ShipWidget::onMaximize');
                            // },

                            // onSignIn: function(credential){
                            //   console.log('ShipWidget::onSignIn', credential);
                            // },

                            // onSignOut: function(){
                            //   console.log('ShipWidget::onSignOut');
                            // }

                            // onPositionChange: function(){
                            //   console.log('ShipWidget::onPositionChange');
                            // },

                            // resize: function(){
                            //   console.log('ShipWidget::resize');
                            // }


                    });

            });