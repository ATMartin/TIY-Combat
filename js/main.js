// Globals
var allAbilities = [],
    allClasses = [];

// Player Object (PURPOSE - "Setup")
var Player = function(name, local, human, opts) {
  this.name = name;
  this.local = local;
  this.human = human;
  var opts = opts || {};
  for (opt in opts)
  { this[opt] = opts[opt]; }
  return this;
};

Player.prototype = {
  name: null,
  local: false,
  human: false,
  class: null,
  healthMax: 100,
  healthNow: 100,
  isDead: false,
  doneTurn: false,
  setHealth: function(amt) {
    this.healthNow = amt;
    if (this.healthNow < 0) { this.healthNow = 0; }
    if (this.healthNow > this.healthMax) { this.healthNow = this.healthMax; }
    renderHealth(this);
  },
  doAction: function(ability, target) {
    var target = target || ((ability.targetSelf) ? this : this.opponent);
    var me = this;
    anim(me, 'attacking');
    if (this.target !== this) { anim(target, 'injured'); } 
    doDamage(ability.damage, target);
    writeToConsole(me.name + " performed " + ability.name + " for " + ability.damage + "dmg to " + target.name + "!");
    var nextPlayer = (me === thisPlayer) ? opponent : thisPlayer;
    setTimeout(function() {
         clearAnim(me); 
         gameLoop(nextPlayer);
    }, 1000);
  }
};


// Class Object (PURPOSE - "Setup")
var CharClass = function(name, abilities) {
  this.name = name;
  this.abilities = abilities;
  allClasses.push(this);
  return this;
};

CharClass.prototype = {
  name: null,
  abilities: []
};

// Ability Object (PURPOSE - "Setup")
var Ability = function(name, ref, targetSelf, damage, description) {
  this.name = name;
  this.ref = ref;
  this.targetSelf = targetSelf;
  this.damage = damage;
  this.description = description;
  allAbilities.push(this);
  return this;
}

Ability.prototype = {
  name: null,
  targetSelf: false,
  damage: 0,
  description: null 
};


// Init Basic Abilities (PURPOSE - "Data")
var
  // DPS
  bodySlam = new Ability('Body Slam', 'bodySlam', false, 5, "You bash your opponent!"),
  magicMissile = new Ability('Magic Missile', 'magicMissile', false, 10, "You shoot a concentrated burst of magic power!"),
  // Meatshield
   
  // Heals Plz
  potionHeal = new Ability('Healing Potion', 'potionHeal', true, -10, "Your wounds begin to mend themselves."),
  // Unglued
  finishHim = new Ability('FINISH HIM', 'finishHim', false, 1000, "BONES CRUNCH, YOUR OPPONENT WHIMPERS"),

// Init Player Classes
  monk = new CharClass('Monk', [bodySlam, finishHim]),
  paladin = new CharClass('Paladin', [bodySlam, potionHeal]),
  wizard = new CharClass('Wizard', [magicMissile, finishHim]),
  thief = new CharClass('Thief', [bodySlam, potionHeal]);
  
// DOM Elements (PURPOSE - "Setup")
var
  $console = $('.output'),
  
  $player1 = $('.player1-container'),
  $p1Healthbar = $('.health-box.player1');
  $p1Details = $('.player1.descriptions');
  $p1Model = $('.player1-container');
  $p1HealthText = $('.stat-box.player1 .health-percentage');
  $p1Status = $('.stat-box.player1 .status');

  $player2 = $('.player2-container');
  $p2Healthbar = $('.health-box.player2');
  $p2Details= $('.player2.descriptions');
  $p2Model = $('.player2-container');
  $p2HealthText = $('.stat-box.player2 .health-percentage');
  $p2Status = $('.stat-box.player2 .status');


// Players (PURPOSE - "Data")
var
  thisPlayer = new Player(null, true, true, { healthbar: $p1Healthbar, model: $p1Model, healthtext: $p1HealthText }),
  opponent = new Player("Enemy", true, false, { healthbar: $p2Healthbar, model: $p2Model, healthtext: $p2HealthText });
  thisPlayer.opponent = opponent;
  opponent.opponent = thisPlayer;
   
var randomEnemy = function() {
  var classes = [monk, paladin, wizard, thief];
  opponent.class = opponent.class || classes[Math.floor(Math.random() * classes.length)];
};

// Modal Dialog Controls (PURPOSE - "State")
var sendToBack = function($el) {
  $el.css('z-index', -5);
};

var bringToFront = function($el) {
  $el.css('z-index', 10);
};


// Game Console Controls (PURPOSE - "State")
var writeToConsole = function(msg) {
  $console.text(msg + '\n' + $console.text());
}

var clearConsole = function() {
  $console.text('');
}

//---- GAME ACTIONS & LOGIC ---------

// RENDERHEALTH (PURPOSE - "Presentation")
var renderHealth = function(target) { 
  var percentage = Math.floor((target.healthNow/target.healthMax)*100);
  target.healthtext.text(percentage + "%");
  var newRot = 135 - (target.healthNow/target.healthMax)*90;
  if (target === opponent) { newRot = -newRot; }
  target.healthbar.animate(
    {rot: newRot},
    {step: function(now, tween) {
        if (Math.abs(now) < 45) { return; }
        $(this).css('transform', 'rotateZ('+now+'deg)');
      }, 
      duration: 300
    }
  );
}

// DODAMAGE (PURPOSE - "State")
var doDamage = function(dmg, target) {
  target.setHealth(target.healthNow - dmg);
  if (target.healthNow <= 0) { target.isDead = true; };
};

// RANDOMACTION (PURPOSE - "State");
var randomAction = function(player) {
    var action = player.class.abilities[Math.floor(Math.random() * player.class.abilities.length)];
    player.doAction(action);
};

// LOADCHARMODEL (PURPOSE - "Presentation")
var loadCharModel = function(player) {
  player.model.html($('[data-template="roundling"]').text());
  var weapon = null;
  switch (player.class.name) {
    case "Paladin":
      weapon = 'sword';
      break;
    case "Thief":
      weapon = 'dirk';
      break;
    case "Wizard":
      weapon = 'staff';
      break;
    }
  if (weapon) { player.model.find('.weapon').html($('[data-template="'+weapon+'"]').text()); }
};

// ENDGAME (PURPOSE - "State")
var endGame = function(player) {
  console.log(player.name + " has died first and lost the game!");
  $('.game-over-inner h1').text(player.name + $('.game-over-inner').text());
  bringToFront($('.game-over'));
  $('.game-over').addClass('fade-in');
};

//---- ONLOAD AND GAME LOOP----------

//ONLOAD (PURPOSE - "Setup" / "State")
$(document).ready(function() {
  sendToBack($('.game-over'));
  sendToBack($('.game-init'));
  sendToBack($('.game-main'));
  bringToFront($('.splash'));
  renderHealth(thisPlayer, $p1Healthbar);
  renderHealth(opponent, $p2Healthbar);  
});

//GAMEINIT (PURPOSE - "Setup" / "State")
var gameInit = function() {
  
  $('.player1.name').text(thisPlayer.name);
  $('.player1-container').html($('[data-template="roundling"]').text());
  loadCharModel(thisPlayer);
  thisPlayer.model.find('.roundling').css({'background-color': 'green'});
  thisPlayer.class.abilities.forEach(function(a) {
    $('.player1.abilities').append('<div class="ability" data-ability="'+a.ref+'">'+a.name+'</div>');
  });
  
  randomEnemy();
  $('.player2.name').text(opponent.name);
  loadCharModel(opponent);
  opponent.model.find('.roundling').css({'transform': 'rotateY(180deg)', 'background-color': 'red'});
  opponent.class.abilities.forEach(function(a) {
    $('.player2.abilities').append('<div class="ability" data-ability="'+a.ref+'">'+a.name+'</div>');  
  });
  
  gameLoop(thisPlayer);    
};

//GAMELOOP (PURPOSE - "State")
var gameLoop = function(player) {
  clearAnim(player);
  if (player.isDead === false) {
    console.log(player.name + "'s turn!");
    if (!player.human) { randomAction(player); }
    return;
  } else {
    endGame(player);
  }
}
//----- GRAPHICS EVENTS -------------

//CLEARANIM (PURPOSE - "Presentation")
var clearAnim = function(target) {
  target.model.find('.roundling').attr('class', 'roundling');
}

//ANIM (PURPOSE - "Presentation")
var anim = function(target, animClass) {
  target.model.find('.roundling').addClass(animClass);
};

//----- EVENT HANDLERS --------------

//SPLASH-GO (PURPOSE - "State")
$('.splash-go').on('click', function() {
  sendToBack($('.splash'));
  bringToFront($('.game-init')); 
});

//GAME-GO (PURPOSE - "State")
$('.game-go').on('click', function() {
  thisPlayer.name = $('input.username').val();
  gameInit();
  sendToBack($('.game-init'));
  bringToFront($('.game-main'));
});

//GAME-CLASS (PURPOSE - "Presentation" / "State")
$('.game-class').on('click', function() {
  thisPlayer.class = eval($(this).attr('data-class'));
  $('.game-class').removeClass('game-select-highlight');
  $(this).addClass('game-select-highlight');
});

//ENEMY-CLASS (PURPOSE - "Presentation" / "State")
$('.enemy-class').on('click', function() {
  opponent.class = eval($(this).attr('data-class'));
  $('.enemy-class').removeClass('game-select-highlight');
  $(this).addClass('game-select-highlight');
});

//GAME-SCENE (PURPOSE - "Presentation")
$('.game-scene').on('click', function() {
  var scene = $(this).attr('data-scene');
  if (scene === 'hedges') { $('.hide-behind').css('background', 'url(/img/hedgerow.svg)'); }
  if (scene === 'woods')  { $('.hide-behind').css('background', 'url(/img/scene-forest.svg)'); }
});

//END-GAME (PURPOSE - "State");
$('.end-game').on('click', function(e) { endGame(thisPlayer); });

//ABILITY-MOUSEOVER (PURPOSE - "Presentation")
$('.player1.abilities').on('mouseover', '.ability', function(e) {
  var me = $(this);
  $p1Details.text(_.find(thisPlayer.class.abilities, function(a) { return a.ref===me.attr('data-ability');}).description);  
});

//ABILITY-CLICK (PURPOSE - "State")
$('.player1.abilities').on('click', '.ability', function(e) {
  var me = $(this);
  var action = _.find(thisPlayer.class.abilities, function(a) { return a.ref===me.attr('data-ability');});
  thisPlayer.doAction(action);
});

//ABILITY-MOUSEOVER (PURPOSE - "Presentation")
$('.player2.abilities').on('mouseover', '.ability', function(e) {
  var me = $(this);
  $p2Details.text(_.find(opponent.class.abilities, function(a) { return a.ref===me.attr('data-ability');}).description);  
});

//ABILITY-CLICK (PURPOSE - "State")
$('.player2.abilities').on('click', '.ability', function(e) {
  var me = $(this);
  var action = _.find(opponent.class.abilities, function(a) { return a.ref===me.attr('data-ability');});
  opponent.doAction(action);
});

//GAME-RELOAD (PURPOSE - "State")
$('.game-reload').on('click', function(e) {
  window.location.reload();    
});
