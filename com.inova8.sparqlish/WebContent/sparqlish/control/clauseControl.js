sap.ui.core.HTML.extend("sparqlish.control.clauseControl",  
    {  
				metadata: {
					properties: {
						question: "string"
					},
					events: {
						vote: {}
					},
					aggregations: { 
						_title: {
							type: "sap.m.Label",
							multiple: false,
							visibility: "hidden"
						},
						_rating: {
							type: "sap.m.RatingIndicator",
							multiple: false,
							visibility: "hidden"
						},
						_meta: {
							type: "sap.m.Label",
							multiple: false,
							visibility: "hidden"
						}
					}
				},
				// set up the inner controls
				init: function () {
					var that = this;
					this.setAggregation("_title", new sap.m.Label({
						text: this.getQuestion(),
					}));
					this.setAggregation("_rating", new sap.m.RatingIndicator({
						iconSize: "2rem",
						change: function (oEvent) {
							that._showResults();
							that.fireVote({value: that.getAggregation("_rating").getValue()});
						},
						liveChange: function (oEvent) {
							that._setMeta(oEvent.getParameter("value") + " out of " + oEvent.getSource().getMaxValue());
						}
					}));
					this.setAggregation("_meta", new sap.m.Label({
						text: "Please vote!",
					}));
				},
				// override of setter method to update label
				setQuestion: function (sQuestion) {
					this.setProperty("question", sQuestion, true);
					this.getAggregation("_title").setText(sQuestion);
				},
				// helper function to update the meta text
				_setMeta: function (sMeta) {
					this.getAggregation("_meta").setText(sMeta);
				},
				// helper function to update the layout after voting
				_showResults: function () {
					this.$().addClass("pollResult");
					this.setQuestion("Thank you for voting!");
			
					// TODO: replace fake data
					var fMood = 3.14;
					this.getAggregation("_rating").setValue(fMood).setEnabled(false).$().blur();
					this._setMeta("Todays average mood: " + fMood + " (42 votes)");
				},
				// render a composite with a wrapper div
				renderer: function (oRm, oControl) {
					oRm.write("<div ");
					oRm.writeControlData(oControl);
					oRm.write("class=\"poll\">");
			
					oRm.renderControl(oControl.getAggregation("_title"));
					oRm.renderControl(oControl.getAggregation("_rating"));
					oRm.renderControl(oControl.getAggregation("_meta"));
			
					oRm.write("</div>");
				}
    });  