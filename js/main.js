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
  healthNow: 100
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
var Ability = function(name, targetSelf, damage, description) {
  this.name = name;
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
  bodySlam = new Ability('Body Slam', false, 5, "You bash your opponent!"),
  magicMissle = new Ability('Magic Missle', false, 10, "You shoot a concentrated burst of magic power!"),
  // Meatshield
   
  // Heals Plz
  potionHeal = new Ability('Healing Potion', true, -10, "Your wounds begin to mend themselves."),
  // Unglued
  finishHim = new Ability('FINISH HIM', false, 1000, "BONES CRUNCH, YOUR OPPONENT WHIMPERS"),

// Init Player Classes
  monk = new CharClass('Monk', [bodySlam, finishHim]),
  paladin = new CharClass('Paladin', [bodySlam, potionHeal]),
  wizard = new CharClass('Wizard', [magicMissle, finishHim]),
  thief = new CharClass('Thief', [bodySlam, potionHeal]);
  
// DOM Elements
var
  $console = $('.output'),
  $player1 = $('.player1-container'),
  $player2 = $('.player2-container');
  $p1Healthbar = $('.health-box.player1');
  $p2Healthbar = $('.health-box.player2');

// Players
var
  thisPlayer = new Player(null, true, true, {});
  opponent = new Player(null, true, false, {});

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


//---- ONLOAD AND GAME LOOP----------
$(document).ready(function() {
  sendToBack($('.game-init'));
  sendToBack($('.game-main'));
  bringToFront($('.splash'));  
});

var gameInit = function() {
  $player1.text(thisPlayer.class.name);  
  $('.player1.name').text(thisPlayer.name);
  thisPlayer.class.abilities.forEach(function(a) {
    $('.player1.abilities').append('<div data-ability="'+a+'">'+a.name+'</div>');
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
