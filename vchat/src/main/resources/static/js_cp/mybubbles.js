		var brd = document.createElement("DIV");
		document.body.insertBefore(brd, document.getElementById("board"));
		bubbles = [];
		const d = 5000;
		const o = 0.9;
		const r = 0.0003;
		const fff = 0.0025;
		const p = 0.00000001;
		const minbub = 72;
		const maxbub = 72;
		const cursorXOffset = 5;
		const cursorYOffset = 0;

function getWidth() {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  );
}

		var w = Math.floor(getWidth()/8);
		var gbi; var id;
		function newBubble(x, y, size, color, text1)
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
			bubble.innerHTML = text1;
			bubble.style.textAlign = 'center';
			bubble.style.paddingTop = text1 == 'KILL TOR?' ? Math.floor(bubble.bubbleSize/1.25) + "px" : Math.floor(bubble.bubbleSize/1.9) + "px";
			bubble.setAttribute('onclick', 'this.time = 0; clearInterval(gbi);$(\'showtime\').style.left= this.position.x < 5*w ? this.position.x - 75 + \'px\' : this.position.x - 240 + \'px\';$(\'showtime\').style.top=this.position.y-100+\'px\';$(\'showtime\').style.visibility=\'visible\';$(\'showtime\').style.backgroundColor=this.style.backgroundColor;$(\'sht_div\').innerHTML= refBubbleText(this.innerHTML);var myEffect = new Fx.Morph(\'showtime\', {duration: \'short\',transition: Fx.Transitions.Sine.easeOut});myEffect.start({\'height\': 300,\'width\': 300});');				
			brd.appendChild(bubble);
			if(bubbles == null)
				bubbles = [];
			bubbles.push(bubble);
			return bubble;
		}

		function refBubbleText(text1)
		{
			var text2 = 'OK!';
			
			if (text1 == 'что такое<br>antiTOR?' ) {
				text2 = 'локальный<br>контроль<br>за инетом';
			} else if (text1 == 'сколько<br>стоит?') {
				text2 = '<b>Office Edition</b> за 19,990 RUR';
			} else if (text1 == 'какие<br>есть версии?') {
				text2 = 'если Вы босс, нужна <b>Office Edition</b>';
			} else if (text1 == 'есть<br>бесплатная?') {
				text2 = 'Да -<br>без AI и без видео';
			} else if (text1 == 'чего нет в<br>Home Edition?') {
				text2 = 'без кнопки Офис<br>- за 4990 RUR';
			} else if (text1 == 'что ещe<br>почитать?') {
				text2 = 'См. кнопка<br>Помощь<br>в Меню';
			} else if (text1 == 'где скачать<br>antiTOR?') {
				text2 = 'Нигде - клиентам выдаeм флэшку';
			} else if (text1 == 'какое железо подойдет?') {
				text2 = 'рекомендуем Intel NUC<br>сгодится<br>старый ноутбук';
			} else if (text1 == 'нужен ли админ?') {
				text2 = 'antiTOR в сети<br>автономно';
			} else if (text1 == 'доставка<br>уведомлений?') {
				text2 = 'забейте свой<br>email и телефон';
			}
			
			return text2;
		}
		
		function generateBubbles()
		{
			var size = minbub + (maxbub - minbub) * Math.random();
			var digits = '23456789ABCD';
			var color = '#';
			for (var i = 0; i < 6; i++) {
				color += digits[Math.floor(Math.random() * 12)];
			}
			var text1 = 'KILL TOR?';
			digits = '0123456789ABCDEF';
			var ra = digits[Math.floor(Math.random() * 16)];
			if (ra == '0' || ra == '1' ) {
				text1 = 'что такое<br>antiTOR?';
			} else if (ra == '2' || ra == '3') {
				text1 = 'сколько<br>стоит?';
			} else if (ra == '4' || ra == '5') {
				text1 = 'какие<br>есть версии?';
			} else if (ra == '6' || ra == '7') {
				text1 = 'есть<br>бесплатная?';
			} else if (ra == '8' || ra == '9') {
				text1 = 'чего нет в<br>Home Edition?';
			} else if (ra == 'A') {
				text1 = 'что ещe<br>почитать?';
			} else if (ra == 'B') {
				text1 = 'доставка<br>уведомлений?';
			} else if (ra == 'C') {
				text1 = 'где скачать<br>antiTOR?';
			} else if (ra == 'D') {
				text1 = 'нужен ли админ?';
			} else if (ra == 'E') {
				text1 = 'какое железо подойдет?';
			} else if (ra == 'F') {
				//text1 = 'какое железо подойдет?';
			}
			
			var shi  = Math.random() < 0.5 ? 75 : Math.floor(getWidth()*0.84);
			newBubble(Math.floor(Math.random() * w)+shi, 720, size, color, text1);
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
		id = setInterval(frame, 5);
		gbi = setInterval(generateBubbles, 750);
		
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
