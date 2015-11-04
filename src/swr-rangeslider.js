define( [
		'jquery',
		'underscore',
		'angular',
		'qvangular',
		'qlik',
		'./properties',
		'./initialproperties',
		'text!./swr-slider.ng.html',

		// No return values
		'./lib/external/angular-rangeslider/angular.rangeSlider'
	],
	function ( $, _, angular, qvangular, qlik, props, initprops, ngTemplate ) {
		'use strict';

		return {

			definition: props,
			initialProperties: initprops,
			template: ngTemplate,
			snapshot: {canTakeSnapshot: false},
			controller: ['$scope', '$element', '$timeout', function ( $scope, $element, $timeout ) {

				var opts = $scope.sliderOpts = {
					orientation: 'horizontal',
					step: 1,
					rangeMin: 0,
					rangeMax: 100,
					min: 0,
					max: 100,
					disabled: false,
					minVar: null,
					maxVar: null,
					preventEqualMinMax: true,
					pinHandle: '',
					moveValuesWithHandles: false,
					showValues: true
				};

				opts.step = $scope.layout.props.step;
				opts.rangeMin = $scope.layout.props.rangeMin;
				opts.rangeMax = $scope.layout.props.rangeMax;
				opts.orientation = $scope.layout.props.orientation;
				opts.showValues = $scope.layout.props.showValues;

				$scope.$watchCollection( 'layout.props', function ( newVals, oldVals ) {
					Object.keys( newVals ).forEach( function ( key ) {
						if ( newVals[key] !== oldVals[key] ) {
							console.log( 'Changing ' + key + ' to ' + newVals[key] );
							opts[key] = newVals[key];
						}
					} );
				} );

				$scope.$watch( 'sliderOpts.min', function ( newVal, oldVal ) {
					if ( parseFloat( newVal ) !== parseFloat( oldVal ) ) {
						getApp().variable.setContent( '' + getMinVar() + '', '' + newVal + '' )
							.then( function ( data ) {
								angular.noop();
							}, function ( err ) {
								if ( err ) {
									//Todo: Think of error handling
									window.console.log( 'error', err );
								}
							} );
					}
				} );
				$scope.$watch( 'sliderOpts.max', function ( newVal, oldVal ) {
					if ( parseFloat( newVal ) !== parseFloat( oldVal ) ) {
						getApp().variable.setContent( '' + getMaxVar() + '', '' + newVal + '' );
					}
				} );

				function getApp () {
					return qlik.currApp();
				}

				function getMinVar () {
					return $scope.layout.props.varMin;
				}

				function getMaxVar () {
					return $scope.layout.props.varMax;
				}

				function loadVal ( varName, target ) {

					if ( varName ) {
						getApp().variable.getContent( varName )
							.then( function ( data ) {
								if ( data && data.qContent && data.qContent.qIsNum ) {
									console.info( 'LoadVal: Setting value of variable ' + varName + ' to ' + data.qContent.qString );
									$scope.sliderOpts[target] = data.qContent.qString;
								}
							}, function ( err ) {
								window.console.error( err ); //Todo: Think of error handling and how to expose to the UI
							} )
					}
				}

				/**
				 * Several fixes to allow bind the height of the range-slider to its container.
				 * @param $elem
				 */
				$scope.resizeObj = function ( $elem ) {
					if ( $elem && $elem.length ) {
						var $target = $elem.find( '.ngrs-runner' );
						if ( $scope.layout.props.orientation.indexOf( 'vertical' ) > -1 ) {
							console.log( 'change height' );
							$target.height( $elem.parent().height() - 50 );
						} else {
							$target.height( '' );
						}
					}
				};

				$scope.init = function () {

					$timeout( function (  ) {
						loadVal( getMinVar(), 'min' );
						loadVal( getMaxVar(), 'max' );
					});
					$scope.resizeObj( $element );

				};
				$scope.init();

			}],
			paint: function ( $element /*,layout*/ ) {
				this.$scope.resizeObj( $element );
			},
			resize: function ( $element ) {
				this.$scope.resizeObj( $element );
			}
		};
	} );