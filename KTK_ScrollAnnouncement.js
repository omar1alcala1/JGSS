//======================================================================
// KTK - Scroll Announcement (v1.1.1)
// By Fogomax
//======================================================================

/*:
  * @author Fogomax
  * @plugindesc Allows the creation of rolling announcement
    <KTK ScrollAnnouncement>
  * @help
  ● How to use:
    In an event, write in a Script Call a command with this format:
    scroll_announ("Text", IconIndex, "Color", Italic, Outline, Speed)

    If you wanna a fixed announcement (without scroll), use this format:
    fixed_scroll_announ("Text", IconIndex, "Color", Italic, Outline, Duration)

    As:
    Text - Text to show in the scroll announcement
    IconIndex - Index of the icon from the iconset, if none set it 0
    Color - Color of the text, CSS format
    Italic - If the text will be Italic or not. "true" to yes, "false" to no
    Outline - Size of text outline, 0 if none
    Speed - Text speed, the higher the faster
    Duration - Time the announcement will stay in the screen

  ● Exemple:
    scroll_announ("A simple example", 0, "#FFFFFF", false, 3, 2)
    The text will be "A simple example", white color, with outline, without
    italic and without icon, with velocity of 2.

  @param Fade In
  @desc The background will appear with a fade-in
  @default true

  @param Fade Out
  @desc The background will hide with a fade-in
  @default true

  @param Regular Opacity
  @desc Opacity the background will have (between 0 and 1)
  @default 0.5

 */
 
/*:pt
  * @author Fogomax
  * @plugindesc Permite a criação de anuncios rolantes
    <KTK ScrollAnnouncement>
  * @help
  ● Como utilizar:
    Em um evento, escreva no Chamar Script um comando nesse formato:
    scroll_announ("Texto", IndiceIcone, "Cor", Itálico, Contorno, Velocidade)
    ScrollAnnouncement Texto IndiceIcone Cor Itálico Contorno Velocidade

    Se você quiser um anuncio fixo (sem scroll), use esse formato:
    fixed_scroll_announ("Texto", IndiceIcone, "Cor", Itálico, Contorno, Duração)

    Sendo:
    Texto - Texto a ser exibido
    IndiceIcone - Índice do ícone do iconset, se nenhum deixe 0
    Cor - Cor do texto em formato CSS
    Itálico - Se o texto irá ou não ser em itálico, "true" para sim e "false" para não
    Contorno - Tamanho do contorno do texto, 0 para nenhum
    Velocidade - Velocidade de rolagem do texto, quanto maior, mais rápido
    Duração - Tempo que o anuncio ficará na tela

  ● Exemplo:
    scroll_announ("Frase de exemplo", 0, "#FFFFFF", false, 3, 2)
    O texto a ser exibido será "Frase de exemplo", de cor branca, com contorno, sem
    ser itálico e sem icone, com velocidade 2.

  @param Fade In
  @desc O background irá aparecer com um fade-in
  @default true

  @param Fade Out
  @desc O background irá sumir com um fade-out
  @default true

  @param Regular Opacity
  @desc Opacidade que o background terá (entre 0 e 1)
  @default 0.5

 */

var Imported = Imported || {};
Imported["KTK_ScrollAnnouncement"] = "1.1.0";

var TTK = TTK || {};
TTK.ScrollAnnouncement = {};
var scroll_announ;
var fixed_scroll_announ;

"use strict";

(function($) {
	$.Params = $plugins.filter(function(p) { return p.description.contains('<KTK ScrollAnnouncement>'); })[0].parameters;

	//-----------------------------------------------------------------------------
	// Variables declaration
	//

	$.fadeIn = ($.Params["Fade In"] === 'true');
	$.fadeOut = ($.Params["Fade Out"] === 'true');
	$.bgrOpacity = parseFloat($.Params["Regular Opacity"]);
	$.activeAnnouncement = false;
	$.xposText = 0;
	$.textRev = 0;
	$.text = "";
	$.iconIndex = 0;
	$.velocity = 0;
	$.bgOpacity = 0;
	$.canShowText = false;
	$.closing = false;
	$.maxTick = 0;
	$.tick = 0;
	$.isFixed = false;

	//-----------------------------------------------------------------------------
	// Window_WindowAnnouncement
	//

	function Window_WindowAnnouncement() {
		this.initialize.apply(this, arguments);
	};

	Window_WindowAnnouncement.prototype = Object.create(Window_Base.prototype);
	Window_WindowAnnouncement.prototype.constructor = Window_WindowAnnouncement;

	Window_WindowAnnouncement.prototype.initialize = function() {
		var width = Graphics.width;
		var height = 48;
		Window_Base.prototype.initialize.call(this, 0, 0, width, height);
		this.opacity = 0;
		this.hide();
	};

	Window_WindowAnnouncement.prototype.standardPadding = function() {
		return 0;
	};

	Window_WindowAnnouncement.prototype.showAnnouncement = function(_Text, _IconIndex, _Color, _Italic, _Outline, _Velocity, _Time) {
		if ($.activeAnnouncement)
			return;
		
		$.activeAnnouncement = true;
		if (_Time > 0) {
			$.isFixed = true;
			$.maxTick = _Time;
		}

		$.text = _Text;
		$.iconIndex = _IconIndex;
		$.velocity = _Velocity;

		$.xposText = this.width - 20;
		$.textRev = -(this.textWidth($.text));

		this.contents.clear();
		this.contents.textColor = _Color;
		this.contents.fontItalic = _Italic;
		this.contents.outlineWidth = _Outline;

		if (!$.fadeIn) {
			$.canShowText = true;
			$.bgOpacity = $.bgrOpacity;
			this.drawBackground();
			this.drawMessageText();
		}

		this.show();
	}

	Window_WindowAnnouncement.prototype.update = function() {
		if (!$.activeAnnouncement)
			return;

		if (!$.isFixed)
			this.contents.clear();

		if (!$.canShowText) {
			$.bgOpacity = ($.bgOpacity + 0.1 >= $.bgrOpacity) ? ($.bgrOpacity) : ($.bgOpacity + 0.1);
			if ($.bgOpacity >= $.bgrOpacity)
				$.canShowText = true;
			else {
				this.drawBackground();
				return;
			}
		}

		if ($.tick < $.maxTick && $.isFixed) {
			$.tick++;
			if ($.tick >= $.maxTick) {
				if (!$.fadeOut)
					this.finishAnnouncement();
				else
					$.closing = true;
			}
		}

		if (!$.isFixed)
			$.xposText -= $.velocity;


		if (!$.isFixed) {
			this.drawBackground();
			this.drawMessageText();
			this.drawIcon($.iconIndex, 12, 6);
			this.drawIcon($.iconIndex, Graphics.width - 42, 6);
		}

		if ($.isFixed && $.closing) {
			this.contents.clear();
			this.drawBackground();
			this.drawText();
		}

		if ($.xposText + 10 < $.textRev && !$.closing && !$.isFixed) {
			if (!$.fadeOut)
				this.finishAnnouncement();
			else
				$.closing = true;
		}

		if ($.closing && $.bgOpacity > 0.0) {
			$.bgOpacity = ($.bgOpacity - 0.1 <= 0) ? (0) : ($.bgOpacity - 0.1);
		} else if ($.closing && $.bgOpacity == 0.0)
			this.finishAnnouncement();
	}

	Window_WindowAnnouncement.prototype.drawMessageText = function() {
		if ($.isFixed)
			this.drawText($.text, 0, 6, Graphics.width, "center");
		else
			this.drawText($.text, $.xposText, 6, Graphics.width, 0);
	}

	Window_WindowAnnouncement.prototype.drawBackground = function() {
		this.contents.fillRect(0, 0, Graphics.width, 48, "rgba(0, 0, 0," + $.bgOpacity + ")");
	}

	Window_WindowAnnouncement.prototype.finishAnnouncement = function() {
			this.contents.clear();
			this.eraseVars();
	}

	Window_WindowAnnouncement.prototype.eraseVars = function() {
		$.activeAnnouncement = false;
		$.xposText = 0;
		$.textRev = 0;
		$.text = "";
		$.iconIndex = 0;
		$.velocity = 0;
		$.bgOpacity = 0;
		$.canShowText = false;
		$.closing = false;
		$.maxTick = 0;
		$.tick = 0;
		$.isFixed = false;
	}

	//-----------------------------------------------------------------------------
	// Scene_Map
	//

	var _Scene_Map_start = Scene_Map.prototype.start;
	Scene_Map.prototype.start = function() {
		_Scene_Map_start.call(this);
		this.createScrollAnnouncementWindow();
	};

	var _Scene_Map_update = Scene_Map.prototype.update;
	Scene_Map.prototype.update = function () {
		_Scene_Map_update.call(this);
	};

	Scene_Map.prototype.createScrollAnnouncementWindow = function() {
		this._announ_window = new Window_WindowAnnouncement();
		this.addWindow(this._announ_window);
	};

	//-----------------------------------------------------------------------------
	// Scroll Announcement function
	//

	scroll_announ = function(a, b, c, d, e, f) {
		SceneManager._scene._announ_window.showAnnouncement(a, b, c, d, e, f, 0);
	};

	fixed_scroll_announ = function(a, b, c, d, e, f) {
		SceneManager._scene._announ_window.showAnnouncement(a, b, c, d, e, 0, f);	
	}
})(TTK.ScrollAnnouncement);
