
function levelSetup(num) {
	taskblock.callbacks.startTrial = startTrial;
	taskblock.callbacks.startSegment = startSegment;
	taskblock.callbacks.updateScreen = updateScreen;
	// RT task doesn't have any parameters, but this gets auto-populated with data
	taskblock.parameters = {};
	// RT task won't log any variables either (these get set by the user somewhere in the callbacks)
	// caution: these need a value (e.g. NaN) or they won't run correctly
	taskblock.variables = {};
	taskblock.variables.dir2 = NaN;
	taskblock.variables.nmResp = NaN;
	// Segment timing
	taskblock.segnames = ['wait','sample','delay','test','resp','iti'];
	// Seglen uses specific times
	if (practice) {
		taskblock.segmin = [Infinity,650,650,650,4000,Infinity];
		taskblock.segmax = [Infinity,650,650,650,4000,Infinity];
	} else {
		taskblock.segmin = [Infinity,650,650,650,1500,Infinity];
		taskblock.segmax = [Infinity,650,650,650,1500,Infinity];
	}
	// Responses
	taskblock.response = [0,0,0,0,1,0];
	// Backgroud color (defaults to 0.5)
	taskblock.background = 0.5;
	// If you give different keys 
	// taskblock.keys = 32;
	// Trials
	taskblock.numTrials = numTrials; // can be infinite as well
	// Keys

	return taskblock;
}

function startBlock() {
	jgl.active.dots = initDots(500,5,5,1,0,12,1);

	document.addEventListener("keydown",checkStartTrial,false);
	document.addEventListener("keyup",checkEndTrial,false);
}

function endBlock() {
	document.removeEventListener("keydown",checkStartTrial,false);
	document.removeEventListener("keyup",checkEndTrial,false);
}

function checkEndTrial(event) {
	if (event.which==32) {
		jgl.active.pressed = false;
		if ((jgl.trial.segname!='resp')&&(jgl.trial.segname!='iti')) {
			jgl.active.dead = true;
			return
		}
		if (jgl.trial.segname=='resp') {
			if (jgl.trial.responded[jgl.trial.thisseg]==0) {
				jgl.trial.responded[jgl.trial.thisseg]==1;
				jgl.trial.nmResp = 0;
				checkCorrect(jgl.trial.nmResp);
				jgl.trial.RT[jgl.trial.thisseg] = now() - jgl.timing.segment;

			}
		}
		if (jgl.trial.segname=='iti') {
			if (jgl.trial.responded[jgl.trial.thisseg-1]==0) {
				jgl.trial.responded[jgl.trial.thisseg]==1;
				jgl.trial.nmResp=1;
				checkCorrect(jgl.trial.nmResp);
				jgl.trial.RT[jgl.trial.thisseg]=0;
			}
			event.preventDefault();
			jumpSegment();
		}
	}
}

function checkCorrect(nmResp) {
	if (jgl.trial.match!=nmResp) {
		jgl.trial.correct=1;
		jgl.active.fixColor="#00ff00";
	} else {
		jgl.trial.correct=0;
		jgl.active.fixColor="#ff0000";
	}
}

function startTrial() {
	jgl.active.dead = false;
	if (jgl.trial.match) {
		jgl.trial.dir2 = jgl.trial.dir1;
	} else {
		jgl.trial.dir2 = randomElement([0, Math.PI*1/4, Math.PI*1/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*6/4, Math.PI*7/4]);
		while (jgl.trial.dir1==jgl.trial.dir2) {
			jgl.trial.dir2 = randomElement([0, Math.PI*1/4, Math.PI*1/2, Math.PI*3/4, Math.PI, Math.PI*5/4, Math.PI*6/4, Math.PI*7/4]);
		}
	}
}

function startSegment() {
	jgl.active.fix = 0;
	jgl.active.fixColor = "#ffffff";
	jgl.active.drawDots = 0;
	jgl.active.resp = 0;
	jgl.active.dir = 0;
	switch (jgl.trial.segname) {
		case 'wait':
			jgl.active.fix = 1;
			break;
		case 'sample':
			jgl.active.fix = 1;
			jgl.active.drawDots = 1;
			jgl.active.dir = jgl.trial.dir1;
			break;
		case 'delay':
			jgl.active.fix = 1;
			break;
		case 'test':
			jgl.active.fix = 1;
			jgl.active.drawDots = 1;
			jgl.active.dir = jgl.trial.dir2;
			break;
		case 'resp':
			jgl.active.fix = 1;
			jgl.active.fixColor = "#ffff00";
			break;
		case 'iti':
			if (isNaN(jgl.trial.correct)) {
				jgl.trial.responded[jgl.trial.thisseg]==1;
				jgl.trial.nmResp=1;
				checkCorrect(jgl.trial.nmResp);
				jgl.trial.RT[jgl.trial.thisseg]=0;
				jgl.active.fix = 1;
			}
			if (!jgl.active.pressed) {setTimeout(jumpSegment,1000);}
			break;
	}
}

function upResp() {
	if (jgl.trial.correct==1) {
		jgl.ctx.fillStyle = "#00ff00";
		jglTextDraw("Correct",0,0);
	} else {
		jgl.ctx.fillStyle = "#ff0000";
		jglTextDraw("Wrong",0,0);
	}
}

function updateScreen(t) {
	if (jgl.active.fix) {
		jglFixationCross(jgl.screenInfo.pixPerDeg,1,jgl.active.fixColor,[0,0]);
	}
	if (jgl.active.drawGratings) {
		upGratings(jgl.active.gratings);
	}
	if (jgl.active.resp) {
		upResp();
	}
	if (jgl.active.delayTimer>0) {
		upTimer();
	}
}