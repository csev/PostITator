(function ($)
    {
        /**
         * Auto-growing textareas; technique ripped from Facebook
         *
         * https://github.com/jaz303/jquery-grab-bag/tree/master/javascripts/jquery.autogrow-textarea.js
         */
        $.fn.autogrow = function (options)
        {
            return this.filter('textarea').each(function ()
                {
                    var self = this;
                    var $self = $(self);
                    var minHeight = $self.height();
                    var noFlickerPad = $self.hasClass('autogrow-short') ? 0 : parseInt($self.css('lineHeight')) || 0;

                    var shadow = $('<div></div>').css({
                        position: 'absolute',
                        top: -10000,
                        left: -10000,
                        width: $self.width(),
                        fontSize: $self.css('fontSize'),
                        fontFamily: $self.css('fontFamily'),
                        fontWeight: $self.css('fontWeight'),
                        lineHeight: $self.css('lineHeight'),
                        resize: 'none',
                        'word-wrap': 'break-word' }).
                        appendTo(document.body);

                    var update = function (event)
                    {
                        var times = function (string, number)
                        {
                            for (var i = 0, r = ''; i < number; i++) {if (window.CP.shouldStopExecution(0)) break;r += string;}window.CP.exitedLoop(0);
                            return r;
                        };

                        var val = self.value.replace(/</g, '&lt;').
                            replace(/>/g, '&gt;').
                            replace(/&/g, '&amp;').
                            replace(/\n$/, '<br/>&nbsp;').
                            replace(/\n/g, '<br/>').
                            replace(/ {2,}/g, function (space) {return times('&nbsp;', space.length - 1) + ' ';});

                        // Did enter get pressed?  Resize in this keydown event so that the flicker doesn't occur.
                        if (event && event.data && event.data.event === 'keydown' && event.keyCode === 13) {
                            val += '<br />';
                        }

                        shadow.css('width', $self.width());
                        shadow.html(val + (noFlickerPad === 0 ? '...' : '')); // Append '...' to resize pre-emptively.
                        $self.height(Math.max(shadow.height() + noFlickerPad, minHeight));
                    };

                    $self.change(update).keyup(update).keydown({ event: 'keydown' }, update);
                    $(window).resize(update);

                    update();
                });
        };
    })(jQuery);


var PostITator = {
    options : {} ,
    noteTemp : '<div class="note">' +
'<a href="javascript:;" class="button remove">X</a>' +
'<div class="note_cnt">' +
'<textarea class="cnt" placeholder="Enter note"></textarea>' +
'</div> ' +
'</div>',

    noteZindex : 1,
    deleteNote : function () {
        if ( PostITator.options.onDelete ) {
            PostITator.options.onDelete($(this).parent('.note').attr('id'));
        }
        $(this).parent('.note').hide("puff", { percent: 133 }, 250);
    },

    // https://stackoverflow.com/a/2117523/1994792
    uuidv4: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    newNote: function () {
    var top = $(document).scrollTop();
    console.log('top', top);
    $(PostITator.noteTemp).attr('id', PostITator.uuidv4()).css('top', top).css('right', '50').hide().appendTo("#board").show("fade", 300).draggable().on('dragstart',
        function () {
            $(this).zIndex(++PostITator.noteZindex);
        }).on('dragstop', function() {
            console.log('this', this);
            var id = this.id;
            var top = this.offsetTop;
            var left = this.offsetLeft;
            var text = $(this).find('textarea')[0].value;
            if ( PostITator.options.onChange ) {
                PostITator.options.onChange(id, top, left, text);
            }
        });

    $('.remove').click(PostITator.deleteNote);
    $('textarea').autogrow();

    $('.note');
    return false;
    },

    nextNote: function () {
        PostITator.moveNote(true);
    },
    prevNote: function () {
        PostITator.moveNote(false);
    },
    moveNote : function (forward) {
    var sct = $(document).scrollTop();
    var current = false;
    $('.current').each(function(i, obj) {
        if ( ! current ) current = obj;
    });
    var currentpos = 0;
    if ( current ) {
        currentpos = (current.offsetTop * 5000 ) * current.offsetLeft;
    }
    var first = false;
    var firstpos = false;
    var last = false;
    var lastpos = false;
    var prev = false;
    var prevpos = false;
    var next = false;
    var nextpos = false;
    $('.note').each(function(i, obj) {
        console.log(i,obj);
        pos = (obj.offsetTop * 5000 ) * obj.offsetLeft;
        if ( $(obj).hasClass('current') ) return;
        if ( ! lastpos || pos > lastpos ) {
            last = obj;
            lastpos = pos;
        }
        if ( ! firstpos || pos > firstpos ) {
            first = obj;
            firstpos = pos;
        }
        if ( (! prevpos && pos < currentpos ) || ( prevpos && pos > prevpos ) ) {
            prev = obj
            prevpos = pos;
        }
        if ( (! nextpos && pos > currentpos ) || ( nextpos && pos < nextpos ) ) {
            next = obj
            nextpos = pos;
        }
    });

    // https://stackoverflow.com/a/56687659/1994792
    if ( ! next ) next = first;
    if ( ! prev ) prev = last;
    if ( forward && next ) {
        next.scrollIntoView({ behavior: 'smooth' });
        $(next).addClass('current');
    }
    if ( ! forward && prev ) {
        prev.scrollIntoView({ behavior: 'smooth' });
        $(prev).addClass('current');
    }
    if ( current ) $(current).removeClass('current');
    },

    onDelete : function(id) {
        console.log('onDelete', id);
    },

    onChange : function(id, top, left, text) {
        console.log('onChange', id, top, left, text);
    },
};


