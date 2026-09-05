(function ($) {
    'use strict';




    var navbar = $('.js-navbar:not(.navbar-fixed)');


    $(window).on('load', function () {

        $('.loader').fadeOut(1000);
    });





    /*-------------------------------------------------------------------------------
        language
      -------------------------------------------------------------------------------*/
    jQuery('#menu-header-menu a').on("click", function (e) {
        if(!this.parent().hasClass('menu-item-has-children')){
            $('.close-menu').click();

        }

    });

  

    jQuery('.menu-lang a').on("click", function (e) {
        var myindex = $(this).index();
        jQuery('.menu-lang a').removeClass('active');
        $(this).addClass('active');
        $('.right-boxed a').eq(myindex).addClass('active');


    });


    /*-------------------------------------------------------------------------------
      Navbar
    -------------------------------------------------------------------------------*/


    navbar.affix({
        offset: {
            top: 50
        }
    });


    navbar.on('affix.bs.affix', function () {
        if (!navbar.hasClass('affix')) {
            navbar.addClass('animated slideInDown');
        }
    });

    navbar.on('affixed-top.bs.affix', function () {
        navbar.removeClass('animated slideInDown');

    });

    $('.nav-mobile-list li a[href="#"]').on('click', function () {
        $(this).closest('li').toggleClass('current');
        $(this).closest('li').children('ul').slideToggle(200);
        return false;
    });


    /*-------------------------------------------------------------------------------
      Menu
    -------------------------------------------------------------------------------*/


    $('.navbar-toggle').on('click', function () {
        $('body').removeClass('menu-is-closed').addClass('menu-is-opened');
    });

    $('.close-menu, .click-capture').on('click', function () {
        $('body').removeClass('menu-is-opened').addClass('menu-is-closed');
        $('.menu-list ul').slideUp(300);
    });

    $('.menu-item-has-children >  a').on('click', function () {
        $(this).closest('li').children('ul').toggle(200);
        return false;
    });


    /*-------------------------------------------------------------------------------
      Owl Carousel
    -------------------------------------------------------------------------------*/


    if ($('.owl-carousel').length > 0) {

        $(".review-carousel").owlCarousel({
            responsive: {
                0: {
                    items: 1
                },
                720: {
                    items: 1,

                },
                1280: {
                    items: 1
                }
            },
            responsiveRefreshRate: 0,
            nav: true,
            navText: [],
            animateIn: 'fadeIn',
            dots: false
        });

        $(".project-carousel").owlCarousel({
            responsive: {
                0: {
                    items: 1
                },
                720: {
                    items: 1,

                },
                1280: {
                    items: 1
                }
            },
            autoHeight: true,
            nav: true,
            navText: [],
            loop: true,
            responsiveRefreshRate: 0,
            smartSpeed: 500,
            dots: false
        });

    }


    /*-------------------------------------------------------------------------------
      Full screen sections
    -------------------------------------------------------------------------------*/


    if ($('.pagepiling').length > 0) {

        $('.pagepiling').pagepiling({
            scrollingSpeed: 280,
            loopBottom: true,
            loopTop: true,
            anchors: ['page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'page8'],
            afterLoad: function (anchorLink, index) {
                if ($('.pp-section.active').scrollTop() > 0) {
                    $('.navbar').removeClass('navbar-white');
                }
                else {
                    $('.navbar').addClass('navbar-white');
                }

            }
        });


        /*-------------------------------------------------------------------------------
           Scroll into sections
        /-------------------------------------------------------------------------------*/


        $('.pp-scrollable').on('scroll', function () {
            var scrollTop = $(this).scrollTop();
            if (scrollTop > 0) {
                $('.navbar-2').removeClass('navbar-white');
            }
            else {
                $('.navbar-2').addClass('navbar-white');
            }
        });


        /*-------------------------------------------------------------------------------
           Scroller navigation
        /-------------------------------------------------------------------------------*/


        $('#pp-nav').remove().appendTo('body').addClass('white right-boxed hidden-xs');

        $('.pp-nav-up').on('click', function () {
            $.fn.pagepiling.moveSectionUp();
        });

        $('.pp-nav-down').on('click', function () {
            $.fn.pagepiling.moveSectionDown();
        });
    }


    /*-------------------------------------------------------------------------------
	  Change bacgkround on project section
	-------------------------------------------------------------------------------*/


    $('.project-box').on('mouseover', function () {
        var index = $('.project-box').index(this);
        $('.bg-changer .section-bg').removeClass('active').eq(index).addClass('active');
    });


    /*-------------------------------------------------------------------------------
      Ajax Forms
    -------------------------------------------------------------------------------*/


    if ($('.js-form').length) {
        $('.js-form').each(function () {
            $(this).validate({
                errorClass: 'error wobble-error',
                submitHandler: function (form) {
                    $.ajax({
                        type: "POST",
                        url: "mail.php",
                        data: $(form).serialize(),
                        success: function () {
                            $('.success-message').show();
                        },

                        error: function () {
                            $('.error-message').show();
                        }
                    });
                }
            });
        });
    }


    /*-------------------------------------------------------------------------------
      Ajax Load posts
    -------------------------------------------------------------------------------*/


    var total = jonny_obj.max_num_pages;
    var ajax = true;
    var count = 2;

    jQuery('.more_btn2 , .more_btn , .load-more').on('click', function (event) {
        jQuery(this).addClass('active2');
        if (ajax) {
            if (count > total + count) {
                return false;
            } else {
                if ($("div").is(".no_posts_1")) return;
                loadArticle(count);
                count++;

            }
            ajax = false;
        }
        return false;

    });

    function loadArticle(pageNumber) {
        var ofset = $(".blog-list").length;
        var cat = jonny_obj.cat;
        var is_sticky = "";
        var tag = jonny_obj.tag;
        var year = jonny_obj.year;
        var monthnum = jonny_obj.monthnum;
        var day = jonny_obj.day;
        var type = jonny_obj.type;
        var s = jonny_obj.s;
        jQuery('.load-more').attr('disabled', true);
        $.ajax({
            url: jonny_obj.ajaxurl,
            type: 'POST',
            data: "action=jonny_infinite_scroll&page_no=" + pageNumber + "&ofset=" + ofset +
            "&cat=" + cat + '&tag=' + tag + "&is_sticky=" + is_sticky + '&type=' + type,
            success: function (html) {

                var $moreBlocks = jQuery(html).filter('.post-item');
                jQuery(".b-grid").append(html);
                ajax = true;
                jQuery('.load-more').attr('disabled', false);

            }
        });
        return false;
    }

    /* portfolio */


    jQuery('.p-btn').on('click', function (event) {
        jQuery(this).addClass('active2');
        if (ajax) {
            if (count > total + count) {
                return false;
            } else {
                if ($("div").is(".no_posts_1")) return;
                loadPortfolio(count);
                count++;

            }
            ajax = false;
        }
        return false;

    });


    function loadPortfolio(pageNumber) {

        var ofset = $(".row-blog").length;
        var is_sticky = "";
        var tag = jonny_obj.tag;
        var terms = jonny_obj.terms;
        var year = jonny_obj.year;
        var monthnum = jonny_obj.monthnum;
        var day = jonny_obj.day;
        var type = jonny_obj.type;
        var s = jonny_obj.s;


        jQuery('.p-btn').attr('disabled', true);

        $.ajax({
            url: jonny_obj.ajaxurl,
            type: 'POST',
            data: "action=portfolio_loadmore&page_no=" + pageNumber + "&ofset=" + ofset +
            "&terms=" + terms + '&tag=' + tag + "&is_sticky=" + is_sticky + '&type=' + type,
            success: function (html) {

                jQuery(".row-blog").append(html);
                ajax = true;
                jQuery('.p-btn').attr('disabled', false);

            }
        });
        return false;
    }

})(jQuery);
