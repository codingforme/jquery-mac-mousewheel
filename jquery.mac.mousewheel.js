/*
 * mac mousewheel
 * @author lufeng
 * @desc Mac触摸板的双指事件，注重双指功能
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(require('jquery'));
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.jQuery);
    }
}(this, function ($) {
   	
	var macMouseWheel = function(elem){
		this.$elem = $(elem);
	}

	macMouseWheel.prototype = {
		version : "1.0.0beta1",
		defaults : {
			//容差
			tolerance : 5,
			//起始x
			bX : 0,
			//起始y
			bY : 0,
            //手势滑动路径，x/y (跟onGesture事件同步触发)
            onPath : function(x, y){
                console.log(x, y);
            },
            //时间锁
            timeLock : false,
            //手势捕获时长
            captureTime : 1200,
            //手势点集合x
            xPoints : [],
            //手势点集合y
            yPoints : [],
            //手势点集合差x
            xcPoints : [],
            //手势点集合差y
            ycPoints : [],
            //手势解析，上/下/左/右/放大/缩小 | 由一段时间行为形成
            onGesture : function(gesture){
                console.log(gesture);
                console.log('----end----');
            }
		},
		init : function(options){
			var that = this;
			this.options = $.extend({}, this.defaults, options);
			this.$elem.off("mousewheel").on("mousewheel", function(event){
				that.__eventHalder(event || window.event);
				event.stopPropagation();
            	event.preventDefault();
			});
		},
		__eventHalder: function(event){
			event = $.event.fix(event);
			var wl = event.originalEvent,
				deltaX = wl.wheelDeltaX,
				deltaY = wl.wheelDeltaY;
 			
 			//console.log('x:' + deltaX, 'y:' + deltaY);

 			var finalX,
 				finalY;
 		 	
 		 	if(Math.abs(deltaX) < this.options.tolerance){
 		 		//避免低值差的算法（一般双指缓慢滑动行为）
 		 		finalX = deltaX;		 		
 		 	} else {
				//高值差的算法（一般双指快速滑动行为）
				var xSpace = this.options.bX - deltaX;
				finalX = this.__getFinalSpace(deltaX, xSpace);
 		 	}

 		 	if(Math.abs(deltaY) < this.options.tolerance){
 		 		finalY = deltaY;
 		 	} else {
				var ySpace = this.options.bY - deltaY;				
				finalY = this.__getFinalSpace(deltaY, ySpace);
 		 	}
 	
 		 	if(finalX != 0 || finalY != 0){
 		 		this.options.onPath(finalX, finalY);
 		 		//console.log(deltaX,deltaY);
 		 		this.options.bX = deltaX;
 		 		this.options.bY = deltaY; 		
 		 	}
 		 	this.__storePoints(finalX, finalY, deltaX, deltaY);
 		 	this.__anlaseGesture();
		},
		__getFinalSpace : function(delta, space){
			//当差值不跟滑动方向正负相同时，需舍弃
			return delta > 0 && space > 0 || delta < 0 && space < 0 ? space : 0;
		},
		__storePoints : function(finalX, finalY, deltaX, deltaY){
			this.options.xPoints.push(deltaX);
			this.options.yPoints.push(deltaY);
			this.options.xcPoints.push(finalX);
			this.options.ycPoints.push(finalY);
		},
		__anlaseGesture : function(){
			if(this.options.timeLock) return;
			this.options.timeLock = true;
			var that = this;
			setTimeout(function(){
				
				var gesture = that.__getGesture(
					that.__sumValue(that.options.xcPoints),
				 	that.__sumValue(that.options.ycPoints),
				 	that.__sumValue(that.options.xPoints) + that.__sumValue(that.options.yPoints));
				that.options.onGesture(gesture);
 				that.options.xPoints = [];
				that.options.yPoints = [];
				that.options.xcPoints = [];
				that.options.ycPoints = [];
 				that.options.timeLock = false;
 			}, this.options.captureTime);
		},
		__sumValue : function(arr){
			var sum = 0;
			arr.forEach(function(val){ 
				sum += val;
			});
			return sum;
		},
		__getGesture : function(aX, aY, aXY){
			var abX = Math.abs(aX),
				abY = Math.abs(aY),
				gesture;

			if(aXY != 0 && aXY % 120 == 0){
				if(aXY > 0) gesture = 'zoom';
				else gesture = "mini";
			} else {
				if(abX > abY){
					if(aX > 0){
						gesture = 'right';
					} else {
						gesture = 'left';
					}
				}
				if(abX < abY){
					if (aY > 0) {
						gesture = 'down';
					} else {
						gesture = 'up';
					}
				}
			}
			return gesture;
		}
	}

	$.fn.macMouseWheel = function(options){
		if(options) {
	    	var nM = new macMouseWheel(this);
    		nM.init(options);
    	} else {
    		console.error("mac mousewheel lose options arguments");
    	}
	}
}));