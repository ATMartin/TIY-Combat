// Globals


// Player Object
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
  setHealth: function(amt) {
    this.healthNow = amt;
    renderHealth(this, this.healthbar);
  }
};


// Class Object
var CharClass = function(name, abilities) {
  this.name = name;
  this.abilities = abilities;
  //var me = this;
  //abilities.forEach(function(a) {
  //  me.abilities.push(a);
  //});
  return this;
};

CharClass.prototype = {
  name: null,
  abilities: []
};

// Ability Object
var Ability = function(name, ref, targetSelf, damage, description) {
  this.name = name;
  this.ref = ref;
  this.targetSelf = targetSelf;
  this.damage = damage;
  this.description = description;
  return this;
}

Ability.prototype = {
  name: null,
  targetSelf: false,
  damage: 0,
  description: null 
};


// Init Basic Abilities
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
  
// DOM Elements
var
  $console = $('.output'),
  
  $player1 = $('.player1-container'),
  $p1Healthbar = $('.health-box.player1');
  $p1Details = $('.player1.descriptions');
  
  $player2 = $('.player2-container');
  $p2Healthbar = $('.health-box.player2');
  $p2Details= $('.player2.descriptions');

// Players
var
  thisPlayer = new Player(null, true, true, {healthbar: $p1Healthbar});
  opponent = new Player("Enemy", true, false, {healthbar: $p2Healthbar});

var randomEnemy = function() {
  var classes = [monk, paladin, wizard, thief];
  opponent.class = classes[Math.floor(Math.random() * classes.length)];
};

// Modal Dialog Controls
var sendToBack = function($el) {
  $el.css('z-index', -5);
};

var bringToFront = function($el) {
  $el.css('z-index', 10);
};


// Game Console Controls
var writeToConsole = function(msg) {
  $console.text(msg + '\n' + $console.text());
}

var clearConsole = function() {
  $console.text('');
}

//---- GAME ACTIONS & LOGIC ---------

var renderHealth = function(target, healthbar) {
  var newRot = 135 - (target.healthNow/target.healthMax)*90 ;
  if (target === opponent) { newRot = -newRot; }
  healthbar.animate(
    {rot: newRot},
    {step: function(now, tween) {
        $(this).css('transform', 'rotateZ('+now+'deg)');
      }, 
      duration: 300
    }
  );
}

var doDamage = function(dmg, target) {
  target.setHealth(target.healthNow - dmg);
};

var doAction = function(ability, target) {
    doDamage(ability.damage, target);
}
//---- ONLOAD AND GAME LOOP----------
$(document).ready(function() {
  sendToBack($('.game-init'));
  sendToBack($('.game-main'));
  bringToFront($('.splash'));
  renderHealth(thisPlayer, $p1Healthbar);
  renderHealth(opponent, $p2Healthbar);  
});

var gameInit = function() {
  
  $player1.text(thisPlayer.class.name);
  $('.player1.name').text(thisPlayer.name);
  thisPlayer.class.abilities.forEach(function(a) {
    $('.player1.abilities').append('<div class="ability" data-ability="'+a.ref+'">'+a.name+'</div>');
  });
  
  randomEnemy();
  $player2.text(opponent.class.name);
  $('.player2.name').text(opponent.name);
  opponent.class.abilities.forEach(function(a) {
    $('.player2.abilities').append('<div class="ability" data-ability="'+a.ref+'">'+a.name+'</div>');  
  });    

};


//----- EVENT HANDLERS --------------
$('.splash-go').on('click', function() {
  sendToBack($('.splash'));
  bringToFront($('.game-init')); 
});

$('.game-go').on('click', function() {
  thisPlayer.name = $('input.username').val();
  gameInit();
  sendToBack($('.game-init'));
  bringToFront($('.game-main'));
});

$('.game-class').on('click', function() {
  thisPlayer.class = eval($(this).attr('data-class'));
});

$('.player1.abilities').on('mouseover', '.ability', function(e) {
  var me = $(this);
  $p1Details.text(_.find(thisPlayer.class.abilities, function(a) { return a.ref===me.attr('data-ability');}).description);  
});

$('.player1.abilities').on('click', '.ability', function(e) {
  var me = $(this);
  var action = _.find(thisPlayer.class.abilities, function(a) { return a.ref===me.attr('data-ability');});
  writeToConsole(thisPlayer.name + " perfomed " + action.name + " for " + action.damage + "dmg to " + ((action.targetSelf) ? "themselves." : "their opponent."));  
});

$('.player2.abilities').on('mouseover', '.ability', function(e) {
  var me = $(this);
  $p2Details.text(_.find(opponent.class.abilities, function(a) { return a.ref===me.attr('data-ability');}).description);  
});

$('.player2.abilities').on('click', '.ability', function(e) {
  var me = $(this);
  var action = _.find(opponent.class.abilities, function(a) { return a.ref===me.attr('data-ability');});
  writeToConsole(opponent.name + " performed " + action.name + " for " + action.damage + "dmg to " + ((action.targetSelf) ? "themselves." : "their opponent."));
});


