Laro.register('PD', function (La) {

	var pkg = this;
	
	this.score = 0;
	this.textures = {};
	this.skillHash = {
		'one': ['skill1', 'skill2', 'skill3'],
		'two': ['skill3', 'skill4', 'skill5']
	};
	this.curRole = 'one';

	this.render = null;
	this.getUid = function () {
		var id = 0;
		return function () {
			return id ++;
		}
	}();

	this.init = function (cvsId, w, h) {
		this.canvasId = cvsId;
		this.w = w;
		this.h = h;
		this.canvas = document.getElementById(cvsId);
		this.createRender();

		this.$fsm.init();
		this.$loop.init();
		this.stage = new La.$stage(this.canvas);
		this.stage.CONFIG.isClear = false;

		this.stage.addEventListener('mouseup', function (x, y) {
			if ((PD.$role && PD.$role.fsm.currentState != 1)
				|| (PD.$role && PD.$role.fsm.currentState == 1 && PD.roleMousedown)) {
				if (PD.roleMousedown) {
					PD.startMove = true;
				}
				PD.pieX = x;
				PD.pieY = y;
			}
			
			PD.roleMousedown = false;
		});
		this.stage.addEventListener('touchend', function (x, y) {
			if ((PD.$role && PD.$role.fsm.currentState != 1)
				|| (PD.$role && PD.$role.fsm.currentState == 1 && PD.roleMousedown)) {
				if (PD.roleMousedown) {
					PD.startMove = true;
				}
				PD.pieX = x;
				PD.pieY = y;
			}
			PD.roleMousedown = false;
		});
		this.stage.addEventListener('mousemove', function (x, y) {
			PD.MOUSEDOWN_X = x;
			PD.MOUSEDOWN_Y = y;
		});
		this.stage.addEventListener('touchmove', function (x, y) {
			PD.MOUSEDOWN_X = x;
			PD.MOUSEDOWN_Y = y;
		});
		
//		this.keyboard = new La.Keyboard();

	};

	this.createRender = function () {
		this.oldRender = this.render;
		var oldCanvas = document.getElementById(this.canvasId);
		var canvasParent = oldCanvas.parentNode;

		var canvas = document.createElement('canvas');
		canvas.width = this.w;
		canvas.height = this.h;
		canvas.id = this.canvasId;

		this.render = new La.CanvasRender(canvas, 1, false);
		canvasParent.replaceChild(canvas, oldCanvas);
		this.canvas = canvas;
		
		
	};

	// findScreenTransition
	this.findScreenTransition = function (from, to, out) {
		
	};
	
	// 画工具栏
	this.drawSkillBar = function (render) {
		var skillList = this.skillHash[this.curRole];
		for (var i = 0; i < skillList.length; i ++) {
			var imgW = PD.textures[skillList[i]];
			render.drawImage(imgW, 20 + i*100, 20, 0, 0, 1, false, false);
			render.drawImage(PD.textures['skill_hl'], 20 + i*100, 20, 0, 0, 1, false, false);
		}
		
	};
	this.toggleSkillIcon = function () {
		//先remove不属于当前role的技能icon
		for (var i = 0; i < PD.stage.children.length; i ++) {
			var child = PD.stage.children[i];
			if (child.type == 'skillIcon') {
				PD.stage.children.splice(i, 1);
				i --;
			}
		}
		// 添加对应的icon
		var skillList = this.skillHash[this.curRole];
		for (var i = 0; i < skillList.length; i ++) {
			var tid = skillList[i];
			var skIcon = new La.$sprite(PD.stage.ctx, function () {
				this.type = 'skillIcon';
				this.belongTo = this.curRole;
				this.x = 20 + i*100;
				this.y = 20;
				this.width = 80;
				this.height = 80;
				this.draw = function (tid) {
					return function (render) {
						render.drawImage(PD.textures[tid], 0, 0, 0, 0, 1, false, false);
						render.drawImage(PD.textures['skill_hl'], 0, 0, 0, 0, 1, false, false);
					}
				}(tid);

			});
			skIcon.addEventListener('mouseover', function () { 
				document.body.style['cursor'] = 'pointer';
				PD.mouseOnIcon = true;
			});
			skIcon.addEventListener('mouseout', function () { 
				document.body.style['cursor'] = 'default';
				PD.mouseOnIcon = false;
			});
			skIcon.addEventListener('click', function (tid) { 
				return function () {
					PD.$skill[tid]();
				}
			}(tid));
			skIcon.addEventListener('touchstart', function (tid) {
				return function () {
					PD.$skill[tid]();
				}
			}(tid));
			PD.stage.addChild(skIcon);
		}
	}

	this.screenTransition = null;
	this._c = 255;
	this.screenTransitionDefaultIn = new La.ScreenTransitionFade(new La.Pixel32(this._c, this._c, this._c, 255), new La.Pixel32(this._c, this._c, this._c, 0), 1);
	this.screenTransitionDefaultOut = new La.ScreenTransitionFade(new La.Pixel32(this._c, this._c, this._c, 0), new La.Pixel32(this._c, this._c, this._c, 255), 1);
	
	this.loader = new La.ResourceLoader();
	
	this.roleFaceRight = 1;
	
	this.$monsters = [];
	
	this.Star_Fall = function (result) {
		var name = result.Name,
			score = result.Score;
		var cvs = document.getElementById('big_skill');
		if (name == 'star') {
			cvs.style['display'] = 'none';
			PD.$loop.$.resume();
			PD.$role.setState(6);
		} else {
			// 技能释放失败
			cvs.style['display'] = 'none';
			PD.$loop.$.resume();
		}

	}

});


/* 技能 */
Laro.register('PD.$skill', function (La) {
	
	this['skill1'] = function () {
		PD.$role && PD.$role.setState(4)
	}

	this['skill2'] = function () {
		PD.$role && PD.$role.setState(5)
	}
	
	this['skill3'] = function () {
		var cvs = document.getElementById('big_skill');
		cvs.style['display'] = 'block';
		PD.$loop.$.stop();
	}
});

Laro.register('PD.$states', function (La) {
	var pkg = this;

	// Loading states
	this.Loading = La.BaseState.extend(function () {
		this.barW = 650;
		this.barH = 28;
		
	}).methods({
		enter: function (msg, fromState) {
			console.log('loading', fromState)
			this._t = 0;
			this.font = new La.Font(g_data.font.loading);
			this.title = this.font.generateCanvas('大侠的世界');

			this.progress = 0;
			this.done = false;
			this.doneT = -1;

			this.delayAfter = 0.5;

			var images = [
				'images/map.jpg',
				'images/BG2.jpg',
				'images/role/role-right.png',
				'images/circle.png',
				'images/pie.png',
				'images/skillicon/1.png',
				'images/skillicon/2.png',
				'images/skillicon/3.png',
				'images/skillicon/4.png',
				'images/skillicon/5.png',
				'images/skillicon/highlight.png',
				'images/skillanim/skill1.png',
				'images/skillanim/skill2.png',
				'images/monster/left.png',
				'images/comic/comic1.jpg',
				'images/start-bg.jpg',
				'images/start-btn.png',
				'images/end.jpg',
				'images/GO.png',
				'images/s_skill.png',
				'images/boss_left.png',

				//sound
				'OGG/stage1_sound.ogg',
				'OGG/role_attack.ogg',
				'OGG/role_skill1.ogg',
				'OGG/role_skill2.ogg',
				'OGG/master_die.ogg',

			];

			PD.loader.preload(images, La.curry(this.resourceLoadCallback, this));
			PD.LOAD_IMAGE = document.getElementById('load-image');
			
		},
		resourceLoadCallback: function (p) {
			this.progress = Math.min(1, p);
			if (p >= 1) {
				this.done = true;
				this.doneT = this._t;
			}
		},
		leave: function () {
		
		},
		update: function (dt) {
			this._t += dt;
		},
		draw: function (render) {
			var rw = render.getWidth(),
				rh = render.getHeight();
		//	render.drawFillScreen('#000');
			render.drawText(this.title, (rw-this.title.width)/2, rh/3 - this.title.height, 1);
			
			//render.drawText(this.desc, (rw)/2 + this.desc.height, rh/3 - this.title.height, 1);

			this.drawProgressBar(render);
		},
		drawProgressBar: function (render) {
			var x0 = (render.getWidth()-this.barW)/2,
				y0 = (render.getHeight()/2),
				x1 = (render.getWidth()+this.barW)/2,
				y1 = render.getHeight()/2 + this.barH;
			render.drawRect(x0, y0, x1, y1, '#F5D74F');
			render.context.drawImage(PD.LOAD_IMAGE, 0, 0, this.progress*this.barW, this.barH, x0, y0, this.progress*this.barW, this.barH);
			render.context.drawImage(PD.LOAD_IMAGE, 0, this.barH, 248, 166, x0 + this.progress*this.barW - 175, y0 - 108, 248, 166);
		},
		transition: function () { 
			if (this.done && this.doneT >= 0 && this._t > this.doneT + this.delayAfter) {
				this.host.setState(3);
			}
		}
	});
	
	this.Comic1 = La.BaseState.extend(function () {
	
	}).methods({
		enter: function (msg, fromState) {
			console.log('comic1');

			this._t = 0;
			this.delay = 2;
			this.frameCount = 2;

			PD.loader.loadedImages['images/comic/comic1.jpg'];
			PD.textures['comic1'] = PD.loader.loadImage('images/comic/comic1.jpg');
			//get resources 放在全局 PD 里，以便其他类调用
			
			this.cameras = [
				[0,0,920,560],
				[920,0,744,560],
				[920,560,744,668],
				[0,560,920,668]
			];
			this.currentCamera = 0;
			this.nextCamera = 1;
			this.currentArr = this.cameras[this.currentCamera].slice(0);
		},
		leave: function () {
			
		},
		update: function (dt) {
			this._t += dt;
			if(this._t > this.delay){
				if(this.delay){
					this.delay = 0;
					this._t = 0;
				}

				if(this.currentArr[0] == this.cameras[this.nextCamera][0] &&
					this.currentArr[1] == this.cameras[this.nextCamera][1] &&
					this.currentArr[2] == this.cameras[this.nextCamera][2] &&
					this.currentArr[3] == this.cameras[this.nextCamera][3]
				){
					if(this._t >= this.frameCount*2){
						this.currentCamera += 1;
						this.nextCamera+= 1;
						this._t = 0;
						console.log(this.nextCamera);			
					}
				}else{
					for(var i = 0;i < 4;i++){
						this.currentArr[i] = this.cameras[this.currentCamera][i] + (this._t/this.frameCount>=1? 1 :this._t/this.frameCount) * (this.cameras[this.nextCamera][i] - this.cameras[this.currentCamera][i]);
					}
				}
			}
		},
		draw: function (render) {
			var rw = render.getWidth(),
				rh = render.getHeight();
			render.context.drawImage(PD.textures['comic1'], this.currentArr[0],this.currentArr[1],this.currentArr[2],this.currentArr[3],0,0,rw,rh)
		},
		transition: function () {
			if (this.nextCamera == this.cameras.length) {
				this.host.setState(2);
			}
		}
	})

	this.Begin = La.BaseState.extend(function () {
	
	}).methods({
		enter: function (msg, fromState) {
			console.log('enter');

			this.music = PD.$res.getSound('OGG/stage1_sound.ogg');
			this.music.setVolume(0.3);
            this.music.play('default', true);

            PD.textures['begin_bg'] = PD.loader.loadImage('images/start-bg.jpg');
            PD.textures['begin_btn'] = PD.loader.loadImage('images/start-btn.png');

            this.checkSprite = new La.$sprite(PD.stage.ctx, function () {
				this.x = 960 - 350;
				this.y = 640 - 200;
				this.width = 171;
				this.height = 150;
				this.draw = function () {
				/*	this.ctx.beginPath();
					this.ctx.rect(0, 0, this.width, this.height);
					this.ctx.closePath();
					this.ctx.strokeStyle = 'black';
					this.ctx.stroke(); */
				};
				this.setPos = function (x, y) {
					this.x = x - 53;
					this.y = y-128;
				}
			});
			PD.stage.addChild(this.checkSprite);
			this.checkSprite.addEventListener('mousedown', function (x, y) {
				PD.isBegin = true;

			});
			this.checkSprite.addEventListener('touchstart', function (x, y) {
				PD.isBegin = true;
			});
		},	
		leave: function () {
			
		},
		update: function (dt) {
			this._t += dt;
			
		},
		draw: function (render) {
			var rw = render.getWidth(),
				rh = render.getHeight();
			render.context.drawImage(PD.textures['begin_bg'], 0, 0, rw, rh);
			render.context.drawImage(PD.textures['begin_btn'], 0, 0, 171, 150, rw - 350, rh - 200, 171, 150);
		},
		transition: function () {
			if (PD.isBegin) {
				this.host.setState(1);
			}
		}
	})

	this.END = La.BaseState.extend(function () {
	
	}).methods({
		enter: function (msg, fromState) {
			console.log('end');

            PD.textures['end'] = PD.loader.loadImage('images/end.jpg');
		},	
		leave: function () {
			
		},
		update: function (dt) {
			this._t += dt;
			
		},
		draw: function (render) {
			var rw = render.getWidth(),
				rh = render.getHeight();
			render.context.drawImage(PD.textures['end'], 0, 0, rw, rh);
		},
		transition: function () {
			if (PD.isBegin) {
				this.host.setState(1);
			}
		}
	})

	// Stage1
	this.Stage1 = La.BaseState.extend(function () {
	
	}).methods({
		enter: function (msg, fromState) {
			console.log('stage1');

			this._t = 0;
			//get resources 放在全局 PD 里，以便其他类调用
			PD.textures['map1'] = PD.$res.getImage('map1');
			PD.textures['circle'] = PD.$res.getImage('circle');
			PD.textures['pie'] = PD.$res.getImage('pie');
			PD.textures['skill1'] = PD.$res.getImage('skill1');
			PD.textures['skill2'] = PD.$res.getImage('skill2');
			PD.textures['skill3'] = PD.$res.getImage('skill3');
			PD.textures['skill4'] = PD.$res.getImage('skill4');
			PD.textures['skill5'] = PD.$res.getImage('skill5');
			PD.textures['skill_hl'] = PD.$res.getImage('skill_hl');
			PD.textures['GO'] = PD.$res.getImage('GO');
			PD.textures['skill_rain'] = PD.$res.getImage('skill_rain');
			PD.textures['boss'] = PD.$res.getImage('boss');

			PD.$role = new PD.Role(100, 400);
			PD.$role.setState(0);
			
			this.createMonsters(2);
			
			// add skill icon
			PD.curRole = 'one';
			PD.toggleSkillIcon();

			this.music = PD.$res.getSound('OGG/stage1_sound.ogg');
			this.music.setVolume(0.3);
            this.music.play('default', true);

		},
		createMonsters: function (n) {
			for (var i = 0; i < n ; i ++) {
				var x = Math.random()* 900,
					y = Math.random()*400 + 200;
				PD.$monsters.push(new PD.Master(x, y));
			}
		},
		updateMonsters: function (dt) {
			PD.$monsters.sort(function (a, b) { return a.y - b.y });
			var hasNear = false;
			for (var i = 0; i < PD.$monsters.length; i ++) {
				var mo = PD.$monsters[i];
				mo.update(dt);
				if (mo.x < 50) {mo.x = 50}
				if (mo.x > 900) {mo.x = 900}
			}
			
		},
		drawMonsters: function (render) {
			for (var i = 0; i < PD.$monsters.length; i ++) {
				var mo = PD.$monsters[i];
				mo.draw(render);
			}
		},
		leave: function () {
			
		},
		update: function (dt) {
			this._t += 0;
			PD.$role.update(dt);
			this.updateMonsters(dt);
		},
		draw: function (render) {
			var cx = render.getWidth()/2,
				cy = render.getHeight()/2;

			render.drawImage(PD.textures['map1'], cx, cy, 0, 1, 1, false, false);
			
			// 画控制人物的圆饼
			PD.showCircle && this.drawPie(render);
			PD.$role.draw(render);
			this.drawMonsters(render);

		},
		drawPie: function (render) {
			var x = PD.roleMousedown ? PD.MOUSEDOWN_X : PD.pieX;
			var y = PD.roleMousedown ? PD.MOUSEDOWN_Y : PD.pieY;
			if (y < 170) { y = 170 }
			
			render.drawImage(PD.textures['pie'], x, y, 0, 1, 1, false, false);
			// 连接线
			var ctx = render.context;
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(PD.$role.x, PD.$role.y);
			ctx.lineTo(x, y);
			ctx.closePath();
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 5;
			ctx.stroke();
			ctx.restore();
			
			// 判断 左右
			if (x >= PD.$role.x) {
				PD.roleFaceRight = 1;
			} else {
				PD.roleFaceRight = 0;
			}
		},
		transition: function () {
		
		}
	});
	
// 第二场景
	this.Stage2 = La.BaseState.extend(function () {
	
	}).methods({
		enter: function (msg, fromState) {
			console.log('stage1');

			this._t = 0;
			//get resources 放在全局 PD 里，以便其他类调用
			PD.textures['map1'] = PD.$res.getImage('map1');
			PD.textures['map2'] = PD.$res.getImage('map2');
			PD.textures['circle'] = PD.$res.getImage('circle');
			PD.textures['pie'] = PD.$res.getImage('pie');
			PD.textures['skill1'] = PD.$res.getImage('skill1');
			PD.textures['skill2'] = PD.$res.getImage('skill2');
			PD.textures['skill3'] = PD.$res.getImage('skill3');
			PD.textures['skill4'] = PD.$res.getImage('skill4');
			PD.textures['skill5'] = PD.$res.getImage('skill5');
			PD.textures['skill_hl'] = PD.$res.getImage('skill_hl');
			PD.textures['GO'] = PD.$res.getImage('GO');
			PD.textures['skill_rain'] = PD.$res.getImage('skill_rain');

			PD.$role = new PD.Role(200, 400);
			PD.$role.setState(0);
			
			PD.$boss = new PD.Boss(800, 400);
			PD.$boss.id = 'boss';
			PD.$boss.heath = PD.$boss.fullHeath = 2000;
			PD.$boss.bloodBarW = 200;
			PD.$boss.bloodBarOffset = -80;
			
			this.createMonsters(3);
			
			// add skill icon
			PD.curRole = 'one';
			PD.toggleSkillIcon();

		},
		createMonsters: function (n) {
			for (var i = 0; i < n ; i ++) {
				var x = Math.random()* 900,
					y = Math.random()*400 + 200;
				PD.$monsters.push(new PD.Master(x, y));
			}
			PD.$monsters.push(PD.$boss);
		},
		updateMonsters: function (dt) {
			PD.$monsters.sort(function (a, b) { return a.y - b.y });
			var hasNear = false;
			for (var i = 0; i < PD.$monsters.length; i ++) {
				var mo = PD.$monsters[i];
				mo.update(dt);
				if (mo.x < 50) {mo.x = 50}
				if (mo.x > 900) {mo.x = 900}
			}

		},
		drawMonsters: function (render) {
			for (var i = 0; i < PD.$monsters.length; i ++) {
				var mo = PD.$monsters[i];
				mo.draw(render);
			}
		},
		leave: function () {
			
		},
		update: function (dt) {
			this._t += 0;
			PD.$role.update(dt);
			PD.$boss.update(dt);
			this.updateMonsters(dt);
		},
		draw: function (render) {
			var cx = render.getWidth()/2,
				cy = render.getHeight()/2;

			render.drawImage(PD.textures['map2'], cx, cy, 0, 1, 1, false, false);
			
			// 画控制人物的圆饼
			PD.showCircle && this.drawPie(render);
			
			PD.$boss.draw(render);
			PD.$role.draw(render);
			this.drawMonsters(render);
			
		},
		drawPie: function (render) {
			var x = PD.roleMousedown ? PD.MOUSEDOWN_X : PD.pieX;
			var y = PD.roleMousedown ? PD.MOUSEDOWN_Y : PD.pieY;
			if (y < 170) { y = 170 }
			
			render.drawImage(PD.textures['pie'], x, y, 0, 1, 1, false, false);
			// 连接线
			var ctx = render.context;
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(PD.$role.x, PD.$role.y);
			ctx.lineTo(x, y);
			ctx.closePath();
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 5;
			ctx.stroke();
			ctx.restore();
			
			// 判断 左右
			if (x >= PD.$role.x) {
				PD.roleFaceRight = 1;
			} else {
				PD.roleFaceRight = 0;
			}
		},
		transition: function () {
		
		}
	});
	
		this.GoNext = La.BaseState.extend(function () {
		this.nn = 0;
	}).methods({
		enter: function (msg, fromState) {
			this._t  = 0;
			this.rw = PD.render.getWidth();
			this.rh = PD.render.getHeight();
			this.pos = 0;
			if (this.nn < 2) this.nn += 1;
		},
		leave: function () {
			
		},
		update: function (dt) {
			this._t += dt;
			this.pos += 300*dt;

		},
		draw: function (render) {
			var cx = render.getWidth()/2,
				cy = render.getHeight()/2;

			render.drawImage(PD.textures['map'+this.nn], cx, cy, 0, 1, 1, false, false);
			render.drawImage(PD.textures['GO'], this.pos, cy-50, 0, 1, 1, false, false);
		},
		transition: function () {
			if (this.pos >= this.rw) {
				this.host.setState(5)
			}
		}
	})
});


/**
 * resource
 * 从g_data 里面拿数据
 */
Laro.register('PD.$res', function (La) {
	var pkg = this;

	this.EMBImages = {};
	
	// 获取经包装过的image资源
	// 默认是取第一帧相关数据
	this.getImage = function (name, frame) {
		if (frame == undefined) {
			frame = 0;
		}

		var emb = this.EMBImages[name];
		if (!!emb) {
			return emb[frame];
		}
		for (var k in g_data.imageW) {
			if (name == k) {
				this.EMBImages[k] = {};
				for (var i = 0; i < g_data.imageW[k].data.length; i ++) {
					var data = g_data.imageW[k],
						source = data.data[i],
						filename = data.filename;
					this.EMBImages[k][i] = this.getEMBImage(source, filename);
				}
				return this.EMBImages[name][frame];
			}
		}
	};

	this.getEMBImage = function (source, filename) {
		var width = source[2] - source[0] + 1;
  		var height = source[3] - source[1] + 1;
 
  		var xOffset = source[0] - source[4];
 		var yOffset = source[1] - source[5];
 
    	var textureWidth = xOffset + width + source[6] - source[2];
    	var textureHeight = yOffset + height + source[7] - source[3];
 
   		var image = PD.loader.loadImage(filename);
    	return new La.EMBImage(image, source[0], source[1], width, height, xOffset, yOffset, textureWidth, textureHeight);
		
	};
	
	this.getSound = function (filename) {
		var loader = PD.loader; 
        var loadedSounds = loader.loadedSounds;
        return loadedSounds[filename];
	}
		
})


Laro.register('PD.$fsm', function (La) {
	var pkg = this;

	var statesList = [
		0, PD.$states.Loading,
		1, PD.$states.Comic1,
		2, PD.$states.Stage1,
		3, PD.$states.Begin,
		4, PD.$states.END,
		5, PD.$states.Stage2,
		6, PD.$states.GoNext
	];
	//stateModes
	this.stateModes = {
		kStateActive: 0,
		kTransitionOut: 1,
		kTransitionIn: 2
	};
	this.stateMode = this.stateModes.kStateActive;
	

	this.init = function () {
		this.$ = new La.AppFSM(this, statesList);
		this.setState(0);
	};
	this.setState = function (state, msg, suspendCurrent) {
		this.newState = state;
		this.newMessage = msg;

		if (suspendCurrent || state == -1 || this.$.isSuspended(state)) {
			this.$.setState(state, msg, suspendCurrent);
		} else {
			var st = PD.screenTransitionDefaultOut;
			st.reset();

			this.stateMode = this.stateModes.kTransitionOut;
			PD.screenTransition = st;
		}
	}
	
});

// looper
Laro.register('PD.$loop', function (La) {
	var pkg = this;
	this.init = function () {
		this.$ = new La.Loop(this.looper, this);
	};
	this.looper = function (dt) {
		this.update(dt);
		this.draw();
	};
	this.update = function (dt) {
		if (PD.$fsm.stateMode == PD.$fsm.stateModes.kStateActive) { //属于状态机状态转换
                PD.$fsm.$.update(dt);
		} else {
			!!PD.screenTransition && PD.screenTransition.update(dt);
			if (PD.screenTransition.isDone) {
				if (PD.$fsm.stateMode == PD.$fsm.stateModes.kTransitionOut) {
					var st = PD.screenTransitionDefaultIn;

					st.reset();
					PD.screenTransition = st;
					PD.$fsm.stateMode = PD.$fsm.stateModes.kTransitionIn;
					PD.$fsm.$.setState(PD.$fsm.newState, PD.$fsm.newMessage);
				} else {
					PD.screenTransition = null;
					PD.$fsm.stateMode = PD.$fsm.stateModes.kStateActive;
				}
			}
		}
		
	};
	this.draw = function () {
		PD.render.clear();
		PD.$fsm.$.draw(PD.render);
		PD.screenTransition && PD.screenTransition.draw(PD.render);
		PD.stage && PD.stage.render(PD.render);
		PD.render.flush();
	}

});