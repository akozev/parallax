/*
    version 2.1.2
    fix:
        timeline, resize progress Timeline bug 
    change:
        settings one to once
    replace    
        enterTop,  enterBottom, leaveTop, leaveBottom with cross it's return event type enter_top, enter_bottom, leave_top, leave_bottom, cross_from_top, cross_from_bottom   
    remove
        delay from  staggerFrom, staggerFromTo and staggerTo and add settings.stagger


    version 2.1.2
    add settings { smooth: true, time: .6}
    addTimeline (target, scroll_range, timeline, settings )     

    version 2.0.0
    add settings { debug: false, once: false}
    to :  (target, scroll_range, animation, settings )
    fromTo :  ( target, scroll_range, animation_from, animation_to , settings )
    from : ( target, scroll_range, animation_from,  settings )
    staggerFrom : function (target, scroll_range, animation_from, delay, settings )
    staggerFromTo : function (target, scroll_range, animation_from, animation_to,  settings )
    staggerTo : function (target, scroll_range, animation_to,  settings )
*/
ParallaxUtil = {
    version: '2.1.2',
    has_scroll_event: false,
    map: [],
    count: 0,
    prev_width : $(window).width(),
    default_props : {line:1, time:.6,once:false, smooth:true},

    default : function ( props ){

    },

    add: function(target, scroll_range, tween_max_object, settings) {
        var start, end, self, obj,
            config = settings || {};

        if (config.line == undefined) config.line = 1;
        if (config.time == undefined) config.time = .6;
        if (config.once == undefined) config.once = false;
        if (config.debug == undefined) config.debug = false;
        if (config.smooth == undefined) config.smooth = true;

        if (!ParallaxUtil.has_scroll_event) {
            $(window).scroll(ParallaxUtil.scroll).resize(ParallaxUtil.update);
            ParallaxUtil.has_scroll_event = true;
        }

        target = typeof target == 'string' ? $(target) : target;

        if (config.is_stagger) {
            createParObj(target);
        } else {
            target.each(function() {
                createParObj($(this));
            });
        }

        function createParObj(t) {
            var obj = {
                scroll_range: scroll_range,
                tween_max_object: tween_max_object,             
                progress: 0,
                time: config.time,
                target: t,
                line: mathLine( config.line ),
                once: config.once,
                debug: config.debug,
                stagger: config.stagger,
                smooth: config.smooth,
                lock: false,
                timeline : t.timeline,
                index: ++ParallaxUtil.count,
                cross: config.cross || null,
                is_stagger: config.is_stagger
            }
            if( config.timeline ){
                obj.tl = tween_max_object;
                delete obj.tween_max_object;
            }


            function mathLine( line ){
                if(typeof line == 'number'){
                    return line;
                }
                if( /%/.test(line) ){
                    return parseInt(line.replace('%',''))/100;
                }
                switch( line )
                {
                    case 'top': return 0;
                    case 'center': return 0.5;
                    default: return 1;
                }

                return 1;
            }

            ParallaxUtil.map.push(obj);
            ParallaxUtil.updateSize(obj);
        }

        return ParallaxUtil;
    },

    to: function(target, scroll_range, animation, settings) {
        return ParallaxUtil.add(target, scroll_range, {
            to: animation
        }, settings);
    },

    fromTo: function(target, scroll_range, animation_from, animation_to, settings) {
        return ParallaxUtil.add(target, scroll_range, {
            from: animation_from,
            to: animation_to
        }, settings);
    },

    from: function(target, scroll_range, animation_from, settings) {
        return ParallaxUtil.add(target, scroll_range, {
            from: animation_from
        }, settings);
    },

    staggerFrom: function(target, scroll_range, animation_from, settings) {
        var settings = settings || {};
        settings.is_stagger =  true;
        settings.stagger =  settings.stagger || .2;
        

        return ParallaxUtil.add(target, scroll_range, {
            from: animation_from,
        }, settings);
    },

    staggerFromTo: function(target, scroll_range, animation_from, animation_to,  settings) {
        var settings = settings || {};
        settings.is_stagger =  true;
        settings.stagger =  settings.stagger || .2;

        return ParallaxUtil.add(target, scroll_range, {
            from: animation_from,
            to: animation_to
        }, settings);
    },

    staggerTo: function(target, scroll_range, animation_to, settings) {
        var settings = settings || {};
        settings.is_stagger =  true;
        settings.stagger =  settings.stagger || .2;

        return ParallaxUtil.add(target, scroll_range, {
            to: animation_to,
        }, settings);
    },


    addTimeline: function(target, scroll_range, timeline, settings) {
        timeline.progress(0).pause();
        settings = settings || {};
        settings.timeline = true;
        return ParallaxUtil.add(target, scroll_range, timeline, settings);

    },

    addLine : function ( target, scroll_range,  settings ){
        return ParallaxUtil.add( target, scroll_range, null, settings );
    },

    updateSize: function(obj) {
        var range_start, range_end,
            progress = 0,
            top = $(window).scrollTop();
            scroll_range = obj.scroll_range,
            tween_max_object = obj.tween_max_object,
            $target = obj.target;
        var dy = 0,
            h, o;

        scroll_range = typeof scroll_range != 'function' ? scroll_range : scroll_range(obj.target)
        if (obj.tl) {
            //obj.tl.kill();
            obj.target.removeAttr('style');
        }

        if (typeof scroll_range == "string") {
            if (scroll_range != 'this') {
                scroll_range = {
                    top: scroll_range
                };
                obj.is_line = true;
                obj.last_progress = 0;
            } else {
                range_start = $target.offset().top;
                range_end = range_start + $target.innerHeight();
            }
        }

        
        if (obj instanceof jQuery) //jQuery
        {
            range_start = scroll_range.offset().top;
            range_end = range_start + scroll_range.innerHeight();
        }
        if (scroll_range.top != undefined) {
            if (typeof scroll_range.top == 'number') {
                range_start = scroll_range.top;
            }
            if (typeof scroll_range.top == 'string') {
                if (scroll_range.top.indexOf('%') != -1) {
                    o = scroll_range.top.split('%')[0];
                    dy = ($target.height() * parseInt(o) / 100);
                    range_start = $target.offset().top + dy;
                } else if (scroll_range.top.indexOf('top') != -1) // start+100 start-300
                {
                    o = scroll_range.top.split('top')[1];
                    dy = parseInt(o);
                    range_start = $target.offset().top + dy;
                } else if (scroll_range.top.indexOf('bottom') != -1) // bottom+100 bottom-300
                {
                    o = scroll_range.top.split('bottom')[1];                    
                    range_start = $target.offset().top + $target.height() + parseInt(o);
                } else {
                    o = parseInt(scroll_range.top);
                    range_start = $target.offset().top + o;
                }
            }

            if (scroll_range.bottom != undefined) {
                if (typeof scroll_range.bottom == 'number')
                    range_end = scroll_range.bottom;
                if (typeof scroll_range.bottom == 'string') {
                    if (scroll_range.bottom.indexOf('%') != -1) {
                        o = scroll_range.bottom.split('%')[0];
                        range_end = $target.offset().top + ($target.innerHeight() * parseInt(o) / 100);
                    } else if (scroll_range.bottom.indexOf('top') != -1) // start+100 start-300
                    {
                        o = scroll_range.bottom.split('top')[1];
                        range_end = $target.offset().top + parseInt(o);
                    } else if (scroll_range.bottom.indexOf('bottom') != -1) // bottom+100 bottom-300
                    {
                        o = scroll_range.bottom.split('bottom')[1];
                        range_end = $target.offset().top + $target.innerHeight() + parseInt(o);
                    } else {
                        o = parseInt(scroll_range.bottom);
                        range_end = $target.offset().top + $target.innerHeight() + o;
                    }
                }
            }
        }


        obj.start = range_start;
        obj.end = range_end;
        h = range_end - range_start;

        var line = top + ParallaxUtil.getViewportHeight()*obj.line;
       

        if (obj.is_line) {
            if (obj.start <= line) {
                progress = 1;
                obj.last_progress = progress;
            } else if (obj.start > line) {
                progress = 0;
                obj.last_progress = progress;
            }
        } else {
            if (range_start > line) progress = 0;
            else if (range_end < line) {
                progress = 1;
            } else {
                progress = (line - range_start) / (range_end - range_start);
            }
        }

        if (!obj.tl && obj.tween_max_object && !obj.timeline){
            var tl = new TimelineMax({
               paused: true
            });

            var to = tween_max_object.to != undefined ? typeof tween_max_object.to == 'function' ? tween_max_object.to(obj.target) : tween_max_object.to : null;
            var from = tween_max_object.from != undefined ? typeof tween_max_object.from == 'function' ? tween_max_object.from(obj.target) : tween_max_object.from : null;

            if (from || to) {
                if (from && !to) {
                    from = addOne(from);

                    if (obj.is_stagger) {
                        tl.add(new TweenMax.staggerFrom($target, obj.time, from, obj.stagger));
                    } else
                        tl.add(new TweenMax.from($target, obj.time, from));
                } else if (!from && to) {
                    to = addOne(to);

                    if (obj.is_stagger)
                        tl.add(new TweenMax.staggerTo($target, obj.time, from, to, obj.stagger));
                    else
                        tl.add(new TweenMax.to($target, obj.time, to));
                } else {
                    to = addOne(to);

                    if (obj.is_stagger)
                        tl.staggerFromTo($target, obj.time, from, to, obj.stagger);
                    else
                        tl.add(new TweenMax.fromTo($target, obj.time, from, to));
                }
            } else {
                tween_max_object = addOne(tween_max_object);
                tl.add(new TweenMax.from($target, obj.time, tween_max_object))
            }

           obj.tl = tl; 
        }
        if (obj.debug)
            ParallaxUtil.debug(obj);

        if(obj.tl){
            obj.tl.progress(1);
            obj.tl.progress(progress);
        }

        obj.progress = progress;

        function addOne(tw_obj) {
            if (obj.once) {
                tw_obj.onComplete = ParallaxUtil.remove;
                tw_obj.onCompleteParams = [obj.target];
            }

            return tw_obj
        }


        //ParallaxUtil.scroll();

    },


    resize: function($target, scroll_range, tween_max_object) {
        

        for (var i = 0, l = ParallaxUtil.map.length; i < l; i++) {
            if (ParallaxUtil.map[i].target.is($target)) {
                ParallaxUtil.updateSize(ParallaxUtil.map[i]);
                break;
            }

        }

        return ParallaxUtil.scroll();
    },

    // value 0.0 - 1.0;
    progress: function($target, value) {
        var tl;
        for (var i = 0, l = ParallaxUtil.map.length; i < l; i++) {
            if (ParallaxUtil.map[i].target.is($target)) {
                tl = ParallaxUtil.map[i].tl;
                tl.progress(value)
                break;
            }
        }

        return ParallaxUtil;
    },

    remove: function($target) {
        for (var i = ParallaxUtil.map.length - 1; i > -1; i--) {
            if (ParallaxUtil.map[i].target.is($target)) {
                ParallaxUtil.map.splice(i, 1);
                //some bug here
                break;
            }
        };

        if (!ParallaxUtil.map.length) {
            $(window).unbind("scroll", ParallaxUtil.scroll);
            ParallaxUtil.has_scroll_event = false;
        }

        return ParallaxUtil;
    },

    removeAll: function(reset) {
        if (reset) {
            for (var i = 0, l = ParallaxUtil.map.length; i < l; i++) {
                var tl = ParallaxUtil.map[i].tl;
                tl.progress(0);
            };
        }

        ParallaxUtil.map = null;
        ParallaxUtil.map = [];

        $(window).off("scroll", ParallaxUtil.scroll);
        ParallaxUtil.has_scroll_event = false;

        return ParallaxUtil;
    },

    reset: function($target) {
        for (var i = 0, l = ParallaxUtil.map.length; i < l; i++) {
            if (ParallaxUtil.map[i].target.is($target)) {
                var tl = ParallaxUtil.map[i].tl;
                tl.progress(0);
                break;
            }
        };

        return ParallaxUtil;
    },

    update: function() {
        var w = $(window).width();
        
        if( Math.abs( w-ParallaxUtil.prev_width ) < 100) return;
      
        ParallaxUtil.prev_width = w;

        for (var i = ParallaxUtil.map.length - 1; i > -1; i--) {
            ParallaxUtil.updateSize(ParallaxUtil.map[i]);
        };


        return ParallaxUtil.scroll();
    },

    prev_top : 0,
    scroll: function() {
        if (ParallaxUtil.lock) return;

        var top = $(window).scrollTop();
        var get_viewport_height = ParallaxUtil.getViewportHeight();

        for (var i = 0, l = ParallaxUtil.map.length; i < l; i++) {            
            var obj = ParallaxUtil.map[i];
            if(!obj)continue;           
            var start = obj.start,
                end = obj.end,
                tl = obj.tl,
                prev_progress = obj.progress,
                progress = obj.progress,
                line = top;

            
                line += get_viewport_height*obj.line;
            if (obj.is_line) {

                if (start <= line && obj.last_progress == 0) {
                    progress = 1;
                    if(tl)
                        tl.tweenTo(progress * tl._duration);
                    obj.progress = progress;
                    obj.last_progress = progress;
                    if( obj.cross )obj.cross.apply(obj.target, [ 'cross_from_top', top, obj]);
                } else if (start > line && obj.last_progress == 1) {
                    progress = 0;
                    if(tl)
                        tl.tweenTo(progress);
                    obj.progress = progress;
                    obj.last_progress = progress;
                     if( obj.cross )obj.cross.apply(obj.target, [ 'cross_from_bottom', top, obj]);
                }
            } else {
                if (start >= line) {
                    if (obj.progress != 0) {
                    	if( obj.cross )obj.cross.apply(obj.target, [ 'leave_top', top, obj]);
                        progress = 0;
                        anim(obj, tl, progress);
                    }
                } else if (end <= line) {
                    if (obj.progress != 1) {
                    	if( obj.cross )obj.cross.apply(obj.target,[ 'leave_bottom', top, obj]);
                        progress = 1;
                        anim(obj, tl, progress);
                    }
                } else {
                    progress = (line - start) / (end - start);

                    if(obj.cross && prev_progress == 0 && progress > 0)obj.cross.apply(obj.target, [ 'enter_top', obj]);
                    if(obj.cross && prev_progress == 1 && progress < 1)obj.cross.apply(obj.target, [ 'enter_bottom', obj]);

                    anim(obj, tl, progress);
                }

                obj.progress = progress;
                ParallaxUtil.updateDebugProggress(obj);
            }

        };

        ParallaxUtil.prev_top = top;

        function anim(o, t, p) {
        	if(!t)return;
            if (o.smooth)
                t.tweenTo(p * t._duration);
            else
                t.progress(p)
        }


        return ParallaxUtil;
    },

    disable: function(removeStyle) {
        ParallaxUtil.lock = true;
        for (var i = 0, l = ParallaxUtil.map.length; i < l; i++) {
            var obj = ParallaxUtil.map[i];
            var tl = obj.tl;

            tl.pause(0);
            if (removeStyle) obj.target.removeAttr('style');
        }
    },

    lock: false,
    enable: function() {
        ParallaxUtil.lock = false;
        ParallaxUtil.update();
    },

    debug: function(obj) {
        var border = obj.line ? '1px solid ' + "#" + ((1 << 24) * Math.random() | 0).toString(16) : '1px dotted ' + "#" + ((1 << 24) * Math.random() | 0).toString(16)
        var target = obj.stagger ? obj.target.eq(0) : obj.target;
        var p = $("#parallax-util-debug");
        var h = obj.end ? obj.end - obj.start : 2;

        if (!p.length) {
            $('body').css('position', 'relative').append('<div id="parallax-util-debug" style="pointer-events:none; position:absolute; top:0; left:0;right:0;bottom:0"></div>')
            $('body').append("<div id='parallax-util-debug-line-top' style='position:fixed; top:1px; right:0; width:150px; border-top:1px solid #000; font-size:10; text-align:right'>top line</div>")
            $('body').append("<div id='parallax-util-debug-line-bottom' style='position:fixed; bottom:1px; right:0; width:150px; border-bottom:1px solid #000; font-size:10; text-align:right'>bottom line</div>")
            $('body').append("<div id='parallax-util-debug-line-center' style='position:fixed; top:50%; right:0; height:20px; margin-top:-10px; width:150px; border-bottom:1px solid #000; font-size:10; text-align:right'>center line</div>")
            p = $("#parallax-util-debug");

            var t =  $('#parallax-util-debug').offset().top;
            $('#parallax-util-debug').css({top:-t });
        }

        var pos = obj.line > .5 ? 'top:0' : 'bottom:0';
        var per = (obj.line*100).toFixed(2);

        if( obj.line != 0 && obj.line != 1 && obj.line != .5  && !$('#parallax-util-debug-line-custom-'+per).length ){
            $('body').append("<div id='parallax-util-debug-line-custom-"+per+"' style='position:fixed; top:"+per+"%; right:0; height:20px; margin-top:-10px; width:150px; border-bottom:1px solid #000; font-size:10px; text-align:right'>custom line "+ per+"%</div>")
        }
        p.find('#parallax-util-debug-' + obj.index).remove();
        p.append("<div id='parallax-util-debug-" + obj.index + "' style='left:0;  position: absolute; border: " + border + "; width:100%; height: " + h + "px; top: " + obj.start + "px; background-color: rgba(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + " ,0.05) '><div class='parallax-util-text' style='" + pos + "; position:absolute; font-size:10px; text-transform:uppercase;'></div><div style='" + pos + "; position:absolute; right:0;font-size:10px;'>"+(obj.line*100)+"%</div></div>");
       
    },

    updateDebugProggress: function(obj) {
        if (obj.debug) {
            var t = '#parallax-util-debug-' + obj.index;
            $("#parallax-util-debug").find(t + ' .parallax-util-text').text('progress: ' + obj.progress)
        }
    },

    getViewportHeight: function() {
        //Благодаря Мите за това прекрасен метод
        var viewportheight;

        if (typeof window.innerWidth != 'undefined') {
            viewportheight = window.innerHeight
        } else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {

            viewportheight = document.documentElement.clientHeight;
        } else {
            viewportheight = document.getElementsByTagName('body')[0].clientHeight;
        }

        return viewportheight;
    }
}