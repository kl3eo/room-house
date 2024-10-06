// Copyright to Shen Huang, you can reach me out at shenhuang@live.ca
		var brd = document.createElement("DIV");
		document.body.insertBefore(brd, document.getElementById("board"));
		bubbles = [];
		const d = 5000;
		const o = 0.7;
		const r = 0.001;
		const fff = 0.0025;
		const p = 0.00000001;
		const minbub = 10;
		const maxbub = 50;
		const cursorXOffset = 5;
		const cursorYOffset = 0;
		function newBubble(x, y, size, color)
		{
			var bubble = document.createElement("DIV");
			bubble.setAttribute('class', 'bubble');
			bubble.style = "background-color : " + color + ";";
			bubble.bubbleSize = size;
			bubble.style.height = bubble.bubbleSize * 2 + "px";
			bubble.style.width = bubble.bubbleSize * 2 + "px";
			bubble.time = d;
			bubble.velocity = [];
			bubble.velocity.x = 0;
			bubble.velocity.y = 0;
			bubble.position = [];
			bubble.position.x = x;
			bubble.position.y = y;
			bubble.style.left = bubble.position.x - bubble.bubbleSize + 'px';
			bubble.style.top = bubble.position.y - bubble.bubbleSize + 'px';				
			brd.appendChild(bubble);
			if(bubbles == null)
				bubbles = [];
			bubbles.push(bubble);
			return bubble;
		}
		
		var unFocus = function () {
    			if (document.selection) {
        			document.selection.empty()
    			} else {
       				 window.getSelection().removeAllRanges()
    			}

		}

		var msedwn = false;
		document.onmousedown = function(e) {
			msedwn = true;
		}
		document.onmouseup = function(e) {
			msedwn = false;
			unFocus();
		}
		document.onmousemove = function(e) {
			if(msedwn)
				generateBubbles(e.pageX - brd.offsetLeft + cursorXOffset, e.pageY - brd.offsetTop + cursorYOffset);
			unFocus();
		}
		document.ontouchmove = function(e) {
			generateBubbles(e.touches[0].pageX, e.touches[0].pageY);
		}
		function generateBubbles(x, y)
		{
			var size = minbub + (maxbub - minbub) * Math.random();
			var digits = '0123456789ABCDEF';
			var color = '#';
			for (var i = 0; i < 6; i++) {
				color += digits[Math.floor(Math.random() * 16)];
			}
			newBubble(x, y, size, color);
		}
		function bubblePushAround(deltaTime)
		{
			for(i = 0; i < bubbles.length; i++)
			{
				for(j = i + 1; j < bubbles.length; j++)
				{
					var bubbleOne = bubbles[i];
					var bubbleTwo = bubbles[j];
					var Dx = bubbleOne.position.x - bubbleTwo.position.x;
					var Dy = bubbleOne.position.y - bubbleTwo.position.y;
					var D2 = Dx * Dx + Dy * Dy;
					var R12 = bubbleOne.bubbleSize * bubbleOne.bubbleSize;
					var R22 = bubbleTwo.bubbleSize * bubbleTwo.bubbleSize;
					if(D2 < R12 + R22)
					{
						var D = Math.sqrt(D2);
						var F1 = (D2 - (R12 + R22)) * R22;
						var F2 = (D2 - (R12 + R22)) * R12;
						bubbleOne.velocity.x -= F1 * p * Dx / D * deltaTime;
						bubbleOne.velocity.y += F1 * p * Dy / D * deltaTime;
						bubbleTwo.velocity.x += F2 * p * Dx / D * deltaTime;
						bubbleTwo.velocity.y -= F2 * p * Dy / D * deltaTime;
					}
				}
			}
		}
		var before = Date.now();
		var id = setInterval(frame, 5);
		
		function frame()
		{
			var current = Date.now();
			var deltaTime = current - before;
			before = current;
			bubblePushAround(deltaTime);
			for(i in bubbles)
			{
				var bubble = bubbles[i];
				bubble.time -= deltaTime;
				if(bubble.time > 0)
				{
					bubble.velocity.y += fff * deltaTime;
					bubble.velocity.x -= bubble.velocity.x * r * bubble.bubbleSize * deltaTime;
					bubble.velocity.y -= bubble.velocity.y * r * bubble.bubbleSize * deltaTime;
					bubble.position.x += bubble.velocity.x * deltaTime;
					bubble.position.y -= bubble.velocity.y * deltaTime;
					bubble.style.left = bubble.position.x - bubble.bubbleSize + 'px';
					bubble.style.top = bubble.position.y - bubble.bubbleSize + 'px';
					bubble.style.opacity = o * (bubble.time / d);
				}
				else
				{
					if (typeof bubble.parentNode !== 'undefined') {
						bubble.parentNode.removeChild(bubble);
						bubbles.splice(i, 1);
					}
				}
			}
		}
