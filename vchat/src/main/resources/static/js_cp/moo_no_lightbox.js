var Destructor = new Class({
    destruct: function(scope) {
        scope = scope || window;
        // find the object name in the scope
        var name = Object.keyOf(scope, this);
        // let someone know
        this.fireEvent && this.fireEvent('destroy');
        // remove instance from parent object
        delete scope[name];
    }
});

var ZebraTable = new Class({
			//implements
			Implements: [Options,Events,Destructor],
		
			//options
			options: {
				elements: 'table.list-ta',
				cssEven: 'even',
				cssOdd: 'odd',
				cssHighlight: 'highlight',
				cssMouseEnter: 'mo'
			},
			
			//initialization
			initialize: function(options) {
				//set options
				this.setOptions(options);
				//zebra-ize!
				$$(this.options.elements).each(function(table) {
					this.zebraize(table);
				},this);
			},
			
			//a method that does whatever you want
			zebraize: function(table) {
				//for every row in this table...
				table.getElements('tr').each(function(tr,i) {
					//check to see if the row has th's
					//if so, leave it alone
					//if not, move on
					if(tr.getFirst().get('tag') != 'th') {
						//set the class for this based on odd/even
						var options = this.options, klass = i % 2 ? options.cssEven : options.cssOdd;
						//start the events!
					   	tr.addClass(klass).removeEvents('mouseleave');
						tr.addClass(klass).removeEvents('mouseenter');
						tr.addClass(klass).removeEvents('click');
						tr.addClass(klass).addEvents({
							//mouseenter
							mouseenter: function () {
								if(!tr.hasClass(options.cssHighlight)) tr.addClass(options.cssMouseEnter).removeClass(klass);
							},
							//mouseleave
							mouseleave: function () {
								if(!tr.hasClass(options.cssHighlight)) tr.removeClass(options.cssMouseEnter).addClass(klass);
							},
							//click 
							
							click: function() {//alert('ha!');
								//if it is currently not highlighted
								if(!tr.hasClass(options.cssHighlight))
									tr.removeClass(options.cssMouseEnter).addClass(options.cssHighlight);
								else
									tr.addClass(options.cssMouseEnter).removeClass(options.cssHighlight);
								//tr.toggleClass(options.cssMouseEnter).toggleClass(options.cssHighlight);
								//if(!tr.hasClass(options.cssHighlight)) tr.removeClass(options.cssMouseEnter);
							}
							
						});
					}
				},this);
				//alert('zebra!');
			}
		});

		/* do it! */
//window.addEvent('domready', function() { 
//			var zebraTables = new ZebraTable();
//});

window.addEvent('domready',function() {
	(function($) {
		/* for keeping track of what's "open" */
		var activeClass = 'dropdown-active', showingDropdown, showingMenu, showingParent;
		/* hides the current menu */
		var hideMenu = function() {
			if(showingDropdown) {
				showingDropdown.removeClass(activeClass);
				showingMenu.setStyle('display','none');
			}
		};
		/* recurse through dropdown menus */
		$$('.dropdown_a').each(function(dropdown) {
			/* track elements: menu, parent */
			var parent = dropdown.getParent('div');
			//var menu = dropdown.getNext('div.dropdown-menu'), parent = dropdown.getParent('div');
			/* function that shows THIS menu */
			var showMenu_a = function() {
				hideMenu();
				showingDropdown = dropdown.addClass('dropdown-active');
				showingMenu = $('dropdown1').setStyle('display','block');
				//showingMenu = menu.setStyle('display','block');
				showingParent = parent;
			};
			/* function to show menu when clicked */
			dropdown.addEvent('click',function(e) {
				if(e) e.stop();
				showMenu_a();
			});

		});
		$$('.dropdown_b').each(function(dropdown) {
			/* track elements: menu, parent */
			var parent = dropdown.getParent('div');
			/* function that shows THIS menu */
			var showMenu_b = function() {
				hideMenu();
				showingDropdown = dropdown.addClass('dropdown-active');
				showingMenu = $('dropdown2').setStyle('display','block');
				showingParent = parent;
			};
			/* function to show menu when clicked */
			dropdown.addEvent('click',function(e) {
				if(e) e.stop();
				showMenu_b();
			});

		});
		$$('.dropdown_c').each(function(dropdown) {
			/* track elements: menu, parent */
			var parent = dropdown.getParent('div');
			//var menu = dropdown.getNext('div.dropdown-menu'), parent = dropdown.getParent('div');
			/* function that shows THIS menu */
			var showMenu_a = function() {
				hideMenu();
				showingDropdown = dropdown.addClass('dropdown-active');
				showingMenu = $('dropdown_lang_menu').setStyle('display','block');
				//showingMenu = menu.setStyle('display','block');
				showingParent = parent;
			};
			/* function to show menu when clicked */
			dropdown.addEvent('click',function(e) {
				if(e) e.stop();
				showMenu_a();
			});

		});


	/* hide when clicked outside */
		$(document.body).addEvent('click',function(e) {
			//if(showingParent && !e.target || !$(e.target).getParents().contains(showingParent)) { 
				hideMenu();
			//}
		});
	})(document.id);
});
