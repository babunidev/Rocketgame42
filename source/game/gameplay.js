/* Faithful AS2-to-JavaScript translation. See recovered-source/*.as.
 * Original thresholds, update order within handlers, and quirks are preserved. */
window.installGameplay = function(root, Mouse, Math) {
root.randomint = function(min, max)
{
   var _loc1_ = max - min;
   return Math.round(Math.random() * _loc1_) + min;
}
root.level = 1;
root.points = 0;
root.life = 10000;
root.power = 10000;
root.mother = 1000000;
root.gegner1_mc._y = -78;
root.g1life = 44;
root.g1power1 = 0;
root.g1power2 = 0;
root.gegnerKillAwarded = false;
root.awardGegnerKill = function()
{
   if(root.gegnerKillAwarded) return;
   root.gegnerKillAwarded = true;
   root.points += 250; // +25 Score for destroying the enemy ship
   root.points_txt.text = "Score: " + Math.floor(root.points / 10);
};
root.schuss = 0;
root.strahlImpactFlash = 0;

root.ORIG_FPS = 16;
root.LOGIC_FPS = 48;
root.LOGIC_DT = 1 / 48; // seconds per logic tick
root.TICK = root.ORIG_FPS / root.LOGIC_FPS; // 1/3 — keep real-time speed identical to 16 FPS
root.t = function(v) { return v * root.TICK; };
root.at16 = true;
root._phase = 0;
root.bonusType = "red";
root.bonusAlive = false;
root.bonusPulseOn = true;
root.bonusSpawnTimerSec = 2;
root.rollBonusSpawnDelay = function()
{
   // Rocket-like travel time in seconds, then 50%–150% variance.
   // Halved once more so specials spawn about 2× as often as a full rocket cycle.
   var depth = root.randomint(60, Math.max(61, 500 - root.level * 2));
   var fallSpeed = 5 + Math.round(root.level / 20);
   if(fallSpeed < 1)
   {
      fallSpeed = 1;
   }
   // fallSpeed is px per original 16 Hz frame; use ORIG_FPS for real-time seconds.
   var baseSec = (depth + 400) / fallSpeed / root.ORIG_FPS;
   var pct = root.randomint(50, 150) / 100;
   root.bonusSpawnTimerSec = Math.max(0.75, baseSec * 0.5 * pct);
}
root.styleBonusAsteroid = function()
{
   var glow;
   if(root.bonusType == "red")
   {
      glow = "drop-shadow(0 0 5px #ff2200) drop-shadow(0 0 14px #ff0000) saturate(1.4)";
      root.bonus_mc.schild_mc._visible = false;
   }
   else if(root.bonusType == "green")
   {
      glow = "drop-shadow(0 0 6px #00ff66) drop-shadow(0 0 16px #33ff99) brightness(1.25)";
      root.bonus_mc.schild_mc._visible = false;
   }
   else
   {
      glow = "drop-shadow(0 0 6px #3399ff) drop-shadow(0 0 16px #66ccff) brightness(1.15)";
      root.bonus_mc.schild_mc._visible = true;
      root.bonus_mc.schild_mc._alpha = 100;
   }
   root.bonus_mc.element.style.filter = glow;
}
root.spawnBonusAsteroid = function()
{
   var roll = root.randomint(1,3);
   if(roll == 1)
   {
      root.bonusType = "red";
   }
   else if(roll == 2)
   {
      root.bonusType = "green";
   }
   else
   {
      root.bonusType = "blue";
   }
   root.bonus_mc._x = root.randomint(40,450);
   root.bonus_mc._y = - root.randomint(60, Math.max(61, 500 - root.level * 2));
   root.bonus_mc._alpha = 100;
   root.bonus_mc._visible = true;
   root.bonus_mc.good_mc._visible = true;
   root.bonus_mc.broken_mc._visible = false;
   root.bonus_mc.schild_mc._visible = false;
   root.bonus_mc.schild_mc._alpha = 100;
   root.bonusAlive = true;
   root.bonusPulseOn = true;
   root.styleBonusAsteroid();
}
root.retireBonusAsteroid = function()
{
   root.bonusAlive = false;
   root.bonus_mc._alpha = 0;
   root.bonus_mc.good_mc._visible = true;
   root.bonus_mc.broken_mc._visible = false;
   root.bonus_mc.schild_mc._visible = false;
   root.bonus_mc.element.style.filter = "";
   root.rollBonusSpawnDelay();
}
root.applyBonusPickup = function()
{
   // Display Score is floor(points/10). Blue/green pickups award +15 Score.
   if(root.bonusType == "red")
   {
      root.life -= root.randomint(222,666);
      if(root.life < 0)
      {
         root.life = 0;
      }
      root.life_txt.text = root.life;
      root.schiff_mc.schild_mc._visible = true;
      root.schiff_mc.schild_mc._alpha = 100;
   }
   else if(root.bonusType == "green")
   {
      root.power += root.randomint(333,1717);
      if(root.power > 10000)
      {
         root.power = 10000;
      }
      root.power_txt.text = root.power;
      root.points += 150;
      root.points_txt.text = "Score: " + Math.floor(root.points / 10);
   }
   else
   {
      root.life += root.randomint(777,3333);
      if(root.life > 10000)
      {
         root.life = 10000;
      }
      root.life_txt.text = root.life;
      root.schiff_mc.schild_mc._visible = true;
      root.schiff_mc.schild_mc._alpha = 100;
      root.points += 150;
      root.points_txt.text = "Score: " + Math.floor(root.points / 10);
   }
}
root.strahlImpact_mc._visible = false;
root.flashStrahlImpactAt = function(clip)
{
   // Use the on-screen center of the visible clip (rocket good_mc), mapped into stage space.
   var stage = document.getElementById("game");
   var target = clip && clip.element;
   if(!stage || !target)
   {
      return;
   }
   // Flush transforms so getBoundingClientRect matches this frame's rocket pose.
   if(clip.parent && clip.parent.render)
   {
      clip.parent.dirty = true;
      clip.parent.render();
   }
   if(clip.render)
   {
      clip.dirty = true;
      clip.render();
   }
   var sr = stage.getBoundingClientRect();
   var br = target.getBoundingClientRect();
   if(br.width <= 0 && br.height <= 0)
   {
      return;
   }
   // Horizontal center, near the tip (bottom of the falling rocket sprite).
   var x = (br.left + br.width / 2 - sr.left) * (550 / sr.width);
   var y = (br.top + br.height * 0.92 - sr.top) * (400 / sr.height);
   // Half-scale strahlbroken art center ≈ (10.9, 2.3).
   root.strahlImpact_mc._x = x - 10.9;
   root.strahlImpact_mc._y = y - 2.3;
   root.strahlImpact_mc._alpha = 100;
   root.strahlImpact_mc._visible = true;
   root.strahlImpactFlash = 12; // ~0.25s at 48 fps; pulses like original strahlbroken
}
root.neu_mc._visible = false;
root.gegner1_mc.strahl2_mc._visible = false;
root.gegner1_mc.strahl1_mc._visible = false;
root.gegner1_mc.strahl2broken._visible = false;
root.gegner1_mc.strahl1broken._visible = false;
root.gegner1_mc.schild_mc._visible = false;
root.gegner1_mc.broken_mc._visible = false;
root.alarm_mc.alarm_außen._visible = false;
root.alarm_mc.alarm_mitte._visible = false;
root.alarm_mc.alarm_innen._visible = false;
root.roketi_mc.broken_mc._visible = false;
root.roketi_mc.schild_mc._visible = false;
root.mother_txt.text = root.mother;
root.points_txt.text = "Score: " + Math.floor(root.points / 10);
root.life_txt.text = root.life;
root.power_txt.text = root.power;
root.schiff_mc.schild_mc._visible = false;
root.schiff_mc.strahlbroken_mc._visible = false;
root.mother_mc._visible = false;
root.asteroid1_mc.broken_mc._visible = false;
root.asteroid2_mc.broken_mc._visible = false;
root.asteroid3_mc.broken_mc._visible = false;
root.asteroid4_mc.broken_mc._visible = false;
root.asteroid5_mc.broken_mc._visible = false;
root.asteroid1_mc.schild_mc._visible = false;
root.asteroid2_mc.schild_mc._visible = false;
root.asteroid3_mc.schild_mc._visible = false;
root.asteroid4_mc.schild_mc._visible = false;
root.asteroid5_mc.schild_mc._visible = false;
root.bonus_mc.broken_mc._visible = false;
root.bonus_mc.schild_mc._visible = false;
root.bonus_mc._visible = true;
root.bonus_mc._alpha = 0;
root.bonusAlive = false;
root.rollBonusSpawnDelay();
root.gameover_mc._visible = false;
root.schiff_mc.kondenz._alpha = 0;
Mouse.hide();
root.roketi_mc.onEnterFrame = function()
{
   if(this._x < root._xmouse + 22 && this._x >= 133 && this._y >= 10)
   {
      this._x -= root.t(4);
   }
   else if(this._x > root._xmouse && this._x <= 450 && this._y >= 10)
   {
      this._x += root.t(4);
   }
   root.roketi_mc._y += root.t(5 + Math.round(root.level / 20));
   if(root.roketi_mc._alpha <= 0)
   {
      root.roketi_mc._y = - root.randomint(60,500 - root.level * 2);
      root.roketi_mc._x = root.randomint(40,450);
      root.roketi_mc.good_mc._visible = true;
      root.roketi_mc.broken_mc._visible = false;
      root.roketi_mc.schild_mc._visible = false;
      root.roketi_mc.schild_mc._alpha = 100;
      root.roketi_mc._alpha = 100;
      root.alarm_mc.alarm_außen._alpha = 100;
      root.alarm_mc.alarm_mitte._alpha = 100;
      root.alarm_mc.alarm_innen._alpha = 100;
   }
   if(this.good_mc.flammen_mc._alpha == 100)
   {
      this.good_mc.flammen_mc._alpha = 22;
   }
   else
   {
      this.good_mc.flammen_mc._alpha = 100;
   }
   if(root.gameover_mc._visible == false && this._y >= 25 && this.good_mc._visible == true && root.schiff_mc._x <= this._x - 10 && root.schiff_mc._x >= this._x - 45 && root.schiff_mc.strahl_mc._visible == true)
   {
      if(this.good_mc._visible == true)
      {
         root.points += 70; // +7 Score for destroying the pink rocket
         root.points_txt.text = "Score: " + Math.floor(root.points / 10);
         root.flashStrahlImpactAt(this.good_mc);
         this.schild_mc._visible = true;
         this.schild_mc._alpha = 100;
         window.RaketenspielSfx?.playRoketExplosion();
      }
      this.good_mc._visible = false;
      this.broken_mc._visible = true;
   }
   if(this.broken_mc._visible == true && this._alpha > 0)
   {
      this._alpha -= root.t(7);
   }
   if(this._y >= 400 && root.gameover_mc._visible == false)
   {
      if(this._alpha > 99)
      {
         root.mother -= root.randomint(4500,55555);
         window.RaketenspielSfx?.playRoketExplosion();
      }
      this.good_mc._visible = false;
      this.broken_mc._visible = true;
      root.mother_txt.text = root.mother;
      root.mother_mc._visible = true;
   }
};
root.gegner1_mc.onEnterFrame = function()
{
   if(root.gegner1_mc._alpha <= 0)
   {
      root.gegner1_mc._y = - root.randomint(60,700 - root.level * 2);
      root.gegner1_mc.good_mc._visible = true;
      root.gegner1_mc.broken_mc._visible = false;
      root.gegner1_mc._alpha = 100;
      root.g1life = Math.round(44 + root.level);
      root.gegnerKillAwarded = false;
      // Fresh spawn: no leftover laser charge from the previous pass.
      root.g1power1 = 0;
      root.g1power2 = 0;
      root.gegner1_mc.strahl1_mc._visible = false;
      root.gegner1_mc.strahl2_mc._visible = false;
      root.gegner1_mc.strahl1broken._visible = false;
      root.gegner1_mc.strahl2broken._visible = false;
      root.alarm_mc.alarm_außen._alpha = 100;
      root.alarm_mc.alarm_mitte._alpha = 100;
      root.alarm_mc.alarm_innen._alpha = 100;
   }
   if(root.gegner1_mc._y <= 44)
   {
      root.gegner1_mc._y += root.t(1);
   }
   if(this.good_mc.gegner3flammen_mc._alpha == 100)
   {
      this.good_mc.gegner3flammen_mc._alpha = 67;
   }
   else
   {
      this.good_mc.gegner3flammen_mc._alpha = 100;
   }
   if(this._x < root._xmouse + 22)
   {
      this._x += root.t(2);
   }
   else if(this._x > root._xmouse)
   {
      this._x -= root.t(2);
   }
   if(this.strahl2_mc._alpha == 100 && this.strahl2_mc._visible == true)
   {
      this.strahl2_mc._alpha = 66;
   }
   else
   {
      this.strahl2_mc._alpha = 100;
   }
   if(this.strahl1_mc._alpha == 100 && this.strahl1_mc._visible == true)
   {
      this.strahl1_mc._alpha = 66;
   }
   else
   {
      this.strahl1_mc._alpha = 100;
   }
   if(root.g1power1 >= 1 && this._y >= 45)
   {
      this.strahl1_mc._visible = true;
      root.g1power1 -= root.t(2);
   }
   else
   {
      this.strahl1_mc._visible = false;
   }
   if(root.g1power2 >= 1 && this._y >= 45)
   {
      this.strahl2_mc._visible = true;
      root.g1power2 -= root.t(2);
   }
   else
   {
      this.strahl2_mc._visible = false;
   }
   // Fire-chance roll once per original 16 Hz frame so rate stays the same at 48 FPS.
   if(root.at16)
   {
      root.schuss = root.randomint(1,33);
      if(root.schuss >= 33)
      {
         root.g1power1 = root.randomint(1,100);
      }
      if(root.schuss <= 1)
      {
         root.g1power2 = root.randomint(1,100);
      }
   }
   if(this.strahl1_mc._visible == true && this._y >= 45 && this.good_mc._visible == true && root.schiff_mc._x <= this._x + 66 && root.schiff_mc._x >= this._x - 33)
   {
      if(this.good_mc._visible == true)
      {
         this.strahl1broken._visible = true;
         root.life -= root.t(10);
         root.life_txt.text = Math.round(root.life);
      }
   }
   else
   {
      this.strahl1broken._visible = false;
   }
   if(this.strahl2_mc._visible == true && this._y >= 45 && this.good_mc._visible == true && root.schiff_mc._x <= this._x && root.schiff_mc._x >= this._x - 88)
   {
      if(this.good_mc._visible == true)
      {
         this.strahl2broken._visible = true;
         root.life -= root.t(10);
         root.life_txt.text = Math.round(root.life);
      }
   }
   else
   {
      this.strahl2broken._visible = false;
   }
   if(this.strahl1broken._visible == true || this.strahl2broken._visible == true)
   {
      root.schiff_mc.schild_mc._visible = true;
   }
   if(root.g1life <= 0)
   {
      if(root.gegner1_mc.good_mc._visible == true) root.awardGegnerKill();
      root.gegner1_mc.good_mc._visible = false;
      root.gegner1_mc.broken_mc._visible = true;
   }
   if(this._y >= 25 && this.good_mc._visible == true && root.schiff_mc._x <= this._x + 11 && root.schiff_mc._x >= this._x - 55 && root.schiff_mc.strahl_mc._visible == true)
   {
      if(this.good_mc._visible == true)
      {
         // Score/HP ticks at original 16 Hz so DPS and points stay unchanged.
         if(root.at16)
         {
            root.points += 1;
            root.points_txt.text = "Score: " + Math.floor(root.points / 10);
            root.g1life -= 1;
         }
         root.schiff_mc.strahlbroken_mc._visible = true;
         root.gegner1_mc.schild_mc._visible = true;
      }
      if(root.g1life <= 0)
      {
         if(root.gegner1_mc.good_mc._visible == true) root.awardGegnerKill();
         root.gegner1_mc.good_mc._visible = false;
         root.gegner1_mc.broken_mc._visible = true;
      }
   }
   else
   {
      root.schiff_mc.strahlbroken_mc._visible = false;
      root.gegner1_mc.schild_mc._visible = false;
   }
   if(root.gegner1_mc.broken_mc._visible == true && root.gegner1_mc._alpha > 0)
   {
      root.gegner1_mc._alpha -= root.t(7);
   }
};
root.schiff_mc.strahl_mc._visible = false;
root.bang_mc.onMouseDown = function()
{
   if(root.schiff_mc.strahl_mc._visible == false && root.power > 0)
   {
      root.schiff_mc.strahl_mc._visible = true;
   }
};
root.bang_mc.onMouseUp = function()
{
   root.schiff_mc.strahl_mc._visible = false;
};
root.schiff_mc.onEnterFrame = function()
{
   root.level = parseInt(root.points / 55 + 1);
   root.level_txt.text = "Level: " + root.level;
   root.position_txt.text = "Position: " + root.schiff_mc._x;
   // Regen rolls once per original frame so totals match 16 FPS.
   if(root.at16)
   {
      if(root.power < 10000)
      {
         root.power += root.randomint(1,2);
         root.power_txt.text = Math.round(root.power);
      }
      if(root.life < 10000)
      {
         root.life += root.randomint(1,3);
         root.life_txt.text = Math.round(root.life);
      }
      if(root.mother < 1000000)
      {
         root.mother += root.randomint(11,111);
         root.mother_txt.text = Math.round(root.mother);
         if(root.mother > 1000000)
         {
            root.mother = 1000000;
            root.mother_txt.text = root.mother;
         }
      }
   }
   if(root.gegner1_mc.good_mc._visible == true && root.gegner1_mc._y >= -50 || root.roketi_mc.good_mc._visible == true && root.roketi_mc._y >= -70)
   {
      root.alarm_mc._alpha -= root.t(11);
      root.alarm_mc._visible = true;
      if(root.alarm_mc._visible == true)
      {
         root.alarm_mc.alarm_außen._visible = true;
         root.alarm_mc.alarm_außen._alpha -= root.t(12);
      }
      if(root.alarm_mc._visible == true && root.alarm_mc.alarm_außen._alpha <= 0)
      {
         root.alarm_mc.alarm_mitte._visible = true;
         root.alarm_mc.alarm_mitte._alpha -= root.t(12);
      }
      if(root.alarm_mc._visible == true && root.alarm_mc.alarm_mitte._alpha <= 0)
      {
         root.alarm_mc.alarm_innen._visible = true;
         root.alarm_mc.alarm_innen._alpha -= root.t(12);
      }
      if(root.alarm_mc._alpha <= 25)
      {
         root.alarm_mc._alpha = 100;
      }
   }
   else
   {
      root.alarm_mc._visible = false;
   }
   if(root.mother <= 0)
   {
      root.mother = 0;
      root.mother_txt.text = root.mother;
      root.schiff_mc._visible = false;
   }
   if(root.life <= 0)
   {
      root.life = 0;
      root.life_txt.text = root.life;
      root.schiff_mc._visible = false;
   }
   if(root.schiff_mc._visible == false)
   {
      root.gameover_mc._visible = true;
      root.asteroid1_mc._visible = false;
      root.asteroid2_mc._visible = false;
      root.asteroid3_mc._visible = false;
      root.asteroid4_mc._visible = false;
      root.asteroid5_mc._visible = false;
      root.bonus_mc._visible = false;
      root.gameover_mc.levelEnd_txt.text = root.level;
      // Match the on-screen Score (points/10), then add leftover mothership/laser/life bonus.
      root.gameover_mc.punkteEnd_txt.text = Math.floor(root.points / 10) + Math.floor(root.mother / 500000 + root.power / 1000 + root.life / 1000);
      root.gegner1_mc._visible = false;
      root.roketi_mc._visible = false;
      root.bang_mc._visible = false;
      root.neu_mc._visible = true;
      root.schiff_mc.strahl_mc._visible = false;
      Mouse.show();
   }
   root.neu_mc.onRelease = function()
   {
      root.schiff_mc._visible = true;
      root.gameover_mc._visible = false;
      root.asteroid1_mc._visible = true;
      root.asteroid2_mc._visible = true;
      root.asteroid3_mc._visible = true;
      root.asteroid4_mc._visible = true;
      root.asteroid5_mc._visible = true;
      root.bonus_mc._visible = true;
      root.gameover_mc._y = false;
      root.asteroid1_mc._y = -36;
      root.asteroid2_mc._y = -35;
      root.asteroid3_mc._y = -34;
      root.asteroid4_mc._y = -33;
      root.asteroid5_mc._y = -32;
      root.level = 1;
      root.life = 10000;
      root.power = 10000;
      root.mother = 1000000;
      root.points = 0;
      root.gameover_mc.levelEnd_txt.text = root.level;
      root.points = 0;
      root.gameover_mc.punkteEnd_txt.text = root.points;
      root.gegner1_mc._visible = true;
      root.roketi_mc._visible = true;
      root.bang_mc._visible = true;
      root.neu_mc._visible = false;
      Mouse.hide();
      root.gegner1_mc._alpha = -1;
      root.mother_txt.text = root.mother;
      root.points_txt.text = "Score: " + Math.floor(root.points / 10);
      root.life_txt.text = root.life;
      root.power_txt.text = root.power;
      root.roketi_mc._y = -70;
      root.strahlImpactFlash = 0;
      root.strahlImpact_mc._visible = false;
      root.roketi_mc.schild_mc._visible = false;
      root.asteroid1_mc.schild_mc._visible = false;
      root.asteroid2_mc.schild_mc._visible = false;
      root.asteroid3_mc.schild_mc._visible = false;
      root.asteroid4_mc.schild_mc._visible = false;
      root.asteroid5_mc.schild_mc._visible = false;
      root.bonus_mc.good_mc._visible = true;
      root.bonus_mc.broken_mc._visible = false;
      root.bonus_mc.schild_mc._visible = false;
      root.bonus_mc._alpha = 0;
      root.bonus_mc.element.style.filter = "";
      root.bonusAlive = false;
      root.rollBonusSpawnDelay();
   };
   // Exhaust / kondenz FX paced to original 16 Hz (equality toggles need full steps).
   if(root.at16)
   {
      var _loc2_ = root.randomint(1,17);
      if(_loc2_ >= 10)
      {
         root.schiff_mc.kondenz._alpha += 50;
      }
      else if(_loc2_ <= 2)
      {
         root.schiff_mc.kondenz._alpha = 22;
         root.schiff_mc.kondenz.kondenz2._alpha = 0;
         root.schiff_mc.kondenz.kondenz3._alpha = 0;
         root.schiff_mc.kondenz.kondenz4._alpha = 0;
      }
      if(root.schiff_mc.kondenz._alpha >= 100)
      {
         root.schiff_mc.kondenz.kondenz2._alpha += 45;
         if(root.schiff_mc.kondenz.kondenz2._alpha >= 100)
         {
            root.schiff_mc.kondenz.kondenz3._alpha += 35;
            if(root.schiff_mc.kondenz.kondenz3._alpha >= 100)
            {
               root.schiff_mc.kondenz.kondenz4._alpha += 25;
            }
         }
      }
      if(_loc2_ == 7)
      {
         root.schiff_mc.flammen_mc.funken_mc._alpha = 87;
      }
      else
      {
         root.schiff_mc.flammen_mc.funken_mc._alpha = 0;
      }
      if(root.schiff_mc.flammen_mc._alpha == 100)
      {
         root.schiff_mc.flammen_mc._alpha -= 25;
         root.schiff_mc.strahl_mc._alpha = 55;
         root.schiff_mc.strahlbroken_mc._alpha = 33;
         root.gegner1_mc.schild_mc._alpha = 55;
         root.gegner1_mc.strahl2broken._alpha = 44;
         root.gegner1_mc.strahl1broken._alpha = 44;
         root.schiff_mc.geschoss1_mc.strahl_mc._alpha = 50;
      }
      else if(root.schiff_mc.flammen_mc._alpha == 75)
      {
         root.schiff_mc.flammen_mc._alpha += 25;
         root.schiff_mc.strahl_mc._alpha = 100;
         root.schiff_mc.strahlbroken_mc._alpha = 100;
         root.gegner1_mc.schild_mc._alpha = 100;
         root.gegner1_mc.strahl1broken._alpha = 100;
         root.gegner1_mc.strahl2broken._alpha = 100;
         root.schiff_mc.geschoss1_mc.strahl_mc._alpha = 100;
      }
      if(root.schiff_mc.kondenz.kondenz4._alpha == 100)
      {
         root.schiff_mc.kondenz.kondenz._alpha = 78;
         root.schiff_mc.kondenz.kondenz2._alpha = 78;
         root.schiff_mc.kondenz.kondenz3._alpha = 78;
         root.schiff_mc.kondenz.kondenz4._alpha = 78;
      }
      else if(root.schiff_mc.kondenz.kondenz4._alpha == 78)
      {
         root.schiff_mc.kondenz.kondenz._alpha = 100;
         root.schiff_mc.kondenz.kondenz2._alpha = 100;
         root.schiff_mc.kondenz.kondenz3._alpha = 100;
         root.schiff_mc.kondenz.kondenz4._alpha = 100;
      }
   }
   root.schiff_mc._x = root._xmouse;
   if(root.strahlImpactFlash > 0)
   {
      root.strahlImpact_mc._visible = true;
      // Same pulse as the original beam-break FX (alpha 100 ↔ 33).
      if(root.strahlImpact_mc._alpha >= 100)
      {
         root.strahlImpact_mc._alpha = 33;
      }
      else
      {
         root.strahlImpact_mc._alpha = 100;
      }
      root.strahlImpactFlash -= 1;
      if(root.strahlImpactFlash <= 0)
      {
         root.strahlImpact_mc._visible = false;
         root.strahlImpact_mc._alpha = 100;
      }
   }
   if(root.schiff_mc.strahl_mc._visible == true)
   {
      root.power -= root.t(10);
      root.power_txt.text = Math.round(root.power);
   }
   if(root.power <= 0)
   {
      root.schiff_mc.strahl_mc._visible = false;
   }
   if(root.schiff_mc.schild_mc._visible == true)
   {
      root.schiff_mc.schild_mc._alpha -= root.t(7);
   }
   else
   {
      root.schiff_mc.schild_mc._alpha = 100;
   }
   // Hit damage once per original frame while the fade is in the band.
   if(root.at16 && root.schiff_mc.schild_mc._alpha <= 99 && root.schiff_mc.schild_mc._alpha >= 91)
   {
      root.life -= root.randomint(1,555);
      root.life_txt.text = Math.round(root.life);
   }
   if(root.schiff_mc.schild_mc._alpha <= 0)
   {
      root.schiff_mc.schild_mc._visible = false;
      root.schiff_mc.schild_mc._alpha = 100;
   }
   if(root.asteroid1_mc._y >= 400 && root.asteroid1_mc.broken_mc._visible == false || root.asteroid2_mc._y >= 400 && root.asteroid2_mc.broken_mc._visible == false || root.asteroid3_mc._y >= 400 && root.asteroid3_mc.broken_mc._visible == false || root.asteroid4_mc._y >= 400 && root.asteroid4_mc.broken_mc._visible == false || root.asteroid5_mc._y >= 400 && root.asteroid5_mc.broken_mc._visible == false)
   {
      root.mother_mc._visible = true;
   }
   if(root.at16 && root.mother_mc._alpha <= 99 && root.mother_mc._alpha >= 89)
   {
      root.mother -= root.randomint(555,5555);
      root.mother_txt.text = Math.round(root.mother);
   }
   if(root.mother_mc._visible == true)
   {
      root.mother_mc._alpha -= root.t(10);
   }
   if(root.mother_mc._alpha <= 0)
   {
      root.mother_mc._visible = false;
      root.mother_mc._alpha = 100;
   }
};
root.onEnterFrame = function()
{
   var _loc2_ = parseInt(root.points / 22 + 1) + parseInt(root.points / 33 + 1);

   // --- Special bonus asteroid (own cycle, 50%–150% of rocket-like timing) ---
   if(root.bonusAlive != true && root.bonus_mc.broken_mc._visible != true)
   {
      root.bonusSpawnTimerSec -= root.LOGIC_DT;
      if(root.bonusSpawnTimerSec <= 0 && root.gameover_mc._visible == false)
      {
         root.spawnBonusAsteroid();
      }
   }
   var bonusSpeed = (_loc2_ / 100 * 1.1 + 1.2) * 0.8;
   if(root.bonusAlive == true && root.bonus_mc.good_mc._visible == true)
   {
      if(root.bonus_mc._y >= -800 && root.bonus_mc._y <= 450)
      {
         root.bonus_mc._y += root.t(bonusSpeed);
      }
      // Pulse via opacity flag (do not use _alpha as alive flag).
      if(root.at16)
      {
         root.bonusPulseOn = root.bonusPulseOn != true;
      }
      root.bonus_mc._alpha = root.bonusPulseOn == true ? 100 : 55;
      if(root.bonusType == "blue")
      {
         root.bonus_mc.schild_mc._visible = true;
         root.bonus_mc.schild_mc._alpha = root.bonusPulseOn == true ? 100 : 55;
      }
      if(root.bonus_mc._y >= 405)
      {
         root.retireBonusAsteroid();
      }
      else
      {
         // Laser: only red can be shot down. Green/blue must reach the ship.
         if(root.bonusType == "red" && root.schiff_mc.strahl_mc._visible == true && root.schiff_mc._x <= root.bonus_mc._x + 5 && root.schiff_mc._x >= root.bonus_mc._x - 41)
         {
            root.points += 300; // +30 Score for shooting a red special
            root.points_txt.text = "Score: " + Math.floor(root.points / 10);
            root.bonus_mc.good_mc._visible = false;
            root.bonus_mc.broken_mc._visible = true;
            root.bonus_mc.schild_mc._visible = false;
            root.bonusAlive = false;
            root.bonus_mc._alpha = 100;
         }
         // Ship contact: green/blue = pickup, red = damage.
         if(root.gameover_mc._visible == false && root.bonus_mc.good_mc._visible == true && root.bonus_mc._y <= 365 && root.bonus_mc._y >= 255 && root.bonus_mc._x <= root._xmouse + 35 && root.bonus_mc._x >= root._xmouse - 35)
         {
            root.applyBonusPickup();
            root.bonus_mc.good_mc._visible = false;
            root.bonus_mc.broken_mc._visible = true;
            root.bonus_mc.schild_mc._visible = false;
            root.bonusAlive = false;
            root.bonus_mc._alpha = 100;
         }
      }
   }
   if(root.bonus_mc.broken_mc._visible == true)
   {
      root.bonus_mc._alpha -= root.t(7);
      if(root.bonus_mc._alpha <= 0)
      {
         root.retireBonusAsteroid();
      }
   }

   if(root.asteroid1_mc._y >= -36 && root.asteroid1_mc._y <= 450)
   {
      root.asteroid1_mc._y += root.t(_loc2_ / 100 * 0.9 + 1);
   }
   if(root.asteroid1_mc._alpha <= 0)
   {
      root.asteroid1_mc._y = -36;
      root.asteroid1_mc.good_mc._visible = true;
      root.asteroid1_mc.broken_mc._visible = false;
            root.asteroid1_mc.schild_mc._visible = false;
      root.asteroid1_mc.schild_mc._alpha = 100;
root.asteroid1_mc._alpha = 100;
      if(root.asteroid1_mc._x <= 500)
      {
         root.asteroid1_mc._x += root.randomint(1,111);
      }
      if(root.asteroid1_mc._x >= 501)
      {
         root.asteroid1_mc._x = 20;
      }
   }
   if(root.asteroid1_mc._y >= 405)
   {
      root.asteroid1_mc._alpha = 0;
   }
   if(root.schiff_mc._x <= root.asteroid1_mc._x + 5 && root.schiff_mc._x >= root.asteroid1_mc._x - 41 && root.schiff_mc.strahl_mc._visible == true)
   {
      if(root.asteroid1_mc.good_mc._visible == true)
      {
         root.points += 10;
         root.points_txt.text = "Score: " + Math.floor(root.points / 10);
               root.asteroid1_mc.schild_mc._visible = true;
         root.asteroid1_mc.schild_mc._alpha = 100;
}
      root.asteroid1_mc.good_mc._visible = false;
      root.asteroid1_mc.broken_mc._visible = true;
   }
   if(root.asteroid1_mc._y <= 365 && root.asteroid1_mc._y >= 255 && root.asteroid1_mc.broken_mc._alpha == 100 && root.asteroid1_mc._x <= root._xmouse + 35 && root.asteroid1_mc._x >= root._xmouse - 35)
   {
      root.asteroid1_mc.good_mc._visible = false;
      root.asteroid1_mc.broken_mc._visible = true;
      root.schiff_mc.schild_mc._visible = true;
   }
   if(root.asteroid1_mc.broken_mc._visible == true && root.asteroid1_mc._alpha > 0)
   {
      root.asteroid1_mc._alpha -= root.t(7);
   }
   if(root.asteroid2_mc._y >= -36 && root.asteroid2_mc._y <= 450)
   {
      root.asteroid2_mc._y += root.t(_loc2_ / 100 * 1 + 1.1);
   }
   if(root.asteroid2_mc._alpha <= 0)
   {
      root.asteroid2_mc._y = -36;
      root.asteroid2_mc.good_mc._visible = true;
      root.asteroid2_mc.broken_mc._visible = false;
            root.asteroid2_mc.schild_mc._visible = false;
      root.asteroid2_mc.schild_mc._alpha = 100;
root.asteroid2_mc._alpha = 100;
      if(root.asteroid2_mc._x <= 500)
      {
         root.asteroid2_mc._x += root.randomint(1,111);
      }
      if(root.asteroid2_mc._x >= 501)
      {
         root.asteroid2_mc._x = 20;
      }
   }
   if(root.asteroid2_mc._y >= 405)
   {
      root.asteroid2_mc._alpha = 0;
   }
   if(root.schiff_mc._x <= root.asteroid2_mc._x + 5 && root.schiff_mc._x >= root.asteroid2_mc._x - 41 && root.schiff_mc.strahl_mc._visible == true)
   {
      if(root.asteroid2_mc.good_mc._visible == true)
      {
         root.points += 10;
         root.points_txt.text = "Score: " + Math.floor(root.points / 10);
               root.asteroid2_mc.schild_mc._visible = true;
         root.asteroid2_mc.schild_mc._alpha = 100;
}
      root.asteroid2_mc.good_mc._visible = false;
      root.asteroid2_mc.broken_mc._visible = true;
   }
   if(root.asteroid2_mc._y <= 365 && root.asteroid2_mc._y >= 255 && root.asteroid2_mc.broken_mc._alpha == 100 && root.asteroid2_mc._x <= root._xmouse + 35 && root.asteroid2_mc._x >= root._xmouse - 35)
   {
      root.asteroid2_mc.good_mc._visible = false;
      root.asteroid2_mc.broken_mc._visible = true;
      root.schiff_mc.schild_mc._visible = true;
   }
   if(root.asteroid2_mc.broken_mc._visible == true && root.asteroid2_mc._alpha > 0)
   {
      root.asteroid2_mc._alpha -= root.t(7);
   }
   if(root.asteroid3_mc._y >= -36 && root.asteroid3_mc._y <= 450)
   {
      root.asteroid3_mc._y += root.t(_loc2_ / 100 * 1.1 + 1.2);
   }
   if(root.asteroid3_mc._alpha <= 0)
   {
      root.asteroid3_mc._y = -36;
      root.asteroid3_mc.good_mc._visible = true;
      root.asteroid3_mc.broken_mc._visible = false;
            root.asteroid3_mc.schild_mc._visible = false;
      root.asteroid3_mc.schild_mc._alpha = 100;
root.asteroid3_mc._alpha = 100;
      if(root.asteroid3_mc._x <= 500)
      {
         root.asteroid3_mc._x += root.randomint(20,111);
      }
      if(root.asteroid3_mc._x >= 501)
      {
         root.asteroid3_mc._x = 20;
      }
   }
   if(root.asteroid3_mc._y >= 405)
   {
      root.asteroid3_mc._alpha = 0;
   }
   if(root.schiff_mc._x <= root.asteroid3_mc._x + 5 && root.schiff_mc._x >= root.asteroid3_mc._x - 41 && root.schiff_mc.strahl_mc._visible == true)
   {
      if(root.asteroid3_mc.good_mc._visible == true)
      {
         root.points += 10;
         root.points_txt.text = "Score: " + Math.floor(root.points / 10);
               root.asteroid3_mc.schild_mc._visible = true;
         root.asteroid3_mc.schild_mc._alpha = 100;
}
      root.asteroid3_mc.good_mc._visible = false;
      root.asteroid3_mc.broken_mc._visible = true;
   }
   if(root.asteroid3_mc._y <= 365 && root.asteroid3_mc._y >= 255 && root.asteroid3_mc.broken_mc._alpha == 100 && root.asteroid3_mc._x <= root._xmouse + 35 && root.asteroid3_mc._x >= root._xmouse - 35)
   {
      root.asteroid3_mc.good_mc._visible = false;
      root.asteroid3_mc.broken_mc._visible = true;
      root.schiff_mc.schild_mc._visible = true;
   }
   if(root.asteroid3_mc.broken_mc._visible == true && root.asteroid3_mc._alpha > 0)
   {
      root.asteroid3_mc._alpha -= root.t(7);
   }
   if(root.asteroid4_mc._y >= -36 && root.asteroid4_mc._y <= 450)
   {
      root.asteroid4_mc._y += root.t(_loc2_ / 100 * 1.2 + 1.3);
   }
   if(root.asteroid4_mc._alpha <= 0)
   {
      root.asteroid4_mc._y = -36;
      root.asteroid4_mc.good_mc._visible = true;
      root.asteroid4_mc.broken_mc._visible = false;
            root.asteroid4_mc.schild_mc._visible = false;
      root.asteroid4_mc.schild_mc._alpha = 100;
root.asteroid4_mc._alpha = 100;
      if(root.asteroid4_mc._x <= 500)
      {
         root.asteroid4_mc._x += root.randomint(1,111);
      }
      if(root.asteroid4_mc._x >= 501)
      {
         root.asteroid4_mc._x = 20;
      }
   }
   if(root.asteroid4_mc._y >= 405)
   {
      root.asteroid4_mc._alpha = 0;
   }
   if(root.schiff_mc._x <= root.asteroid4_mc._x + 5 && root.schiff_mc._x >= root.asteroid4_mc._x - 41 && root.schiff_mc.strahl_mc._visible == true)
   {
      if(root.asteroid4_mc.good_mc._visible == true)
      {
         root.points += 10;
         root.points_txt.text = "Score: " + Math.floor(root.points / 10);
               root.asteroid4_mc.schild_mc._visible = true;
         root.asteroid4_mc.schild_mc._alpha = 100;
}
      root.asteroid4_mc.good_mc._visible = false;
      root.asteroid4_mc.broken_mc._visible = true;
   }
   if(root.asteroid4_mc._y <= 365 && root.asteroid4_mc._y >= 255 && root.asteroid4_mc.broken_mc._alpha == 100 && root.asteroid4_mc._x <= root._xmouse + 35 && root.asteroid4_mc._x >= root._xmouse - 35)
   {
      root.asteroid4_mc.good_mc._visible = false;
      root.asteroid4_mc.broken_mc._visible = true;
      root.schiff_mc.schild_mc._visible = true;
   }
   if(root.asteroid4_mc.broken_mc._visible == true && root.asteroid4_mc._alpha > 0)
   {
      root.asteroid4_mc._alpha -= root.t(7);
   }
   if(root.asteroid5_mc._y >= -36 && root.asteroid5_mc._y <= 450)
   {
      root.asteroid5_mc._y += root.t(_loc2_ / 100 * 1.3 + 1.4);
   }
   if(root.asteroid5_mc._alpha <= 0)
   {
      root.asteroid5_mc._y = -36;
      root.asteroid5_mc.good_mc._visible = true;
      root.asteroid5_mc.broken_mc._visible = false;
            root.asteroid5_mc.schild_mc._visible = false;
      root.asteroid5_mc.schild_mc._alpha = 100;
root.asteroid5_mc._alpha = 100;
      if(root.asteroid5_mc._x <= 500)
      {
         root.asteroid5_mc._x += root.randomint(1,111);
      }
      if(root.asteroid5_mc._x >= 501)
      {
         root.asteroid5_mc._x = 20;
      }
   }
   if(root.asteroid5_mc._y >= 405)
   {
      root.asteroid5_mc._alpha = 0;
   }
   if(root.schiff_mc._x <= root.asteroid5_mc._x + 5 && root.schiff_mc._x >= root.asteroid5_mc._x - 41 && root.schiff_mc.strahl_mc._visible == true)
   {
      if(root.asteroid5_mc.good_mc._visible == true)
      {
         root.points += 10;
         root.points_txt.text = "Score: " + Math.floor(root.points / 10);
               root.asteroid5_mc.schild_mc._visible = true;
         root.asteroid5_mc.schild_mc._alpha = 100;
}
      root.asteroid5_mc.good_mc._visible = false;
      root.asteroid5_mc.broken_mc._visible = true;
   }
   if(root.asteroid5_mc._y <= 365 && root.asteroid5_mc._y >= 255 && root.asteroid5_mc.broken_mc._alpha == 100 && root.asteroid5_mc._x <= root._xmouse + 35 && root.asteroid5_mc._x >= root._xmouse - 35)
   {
      root.asteroid5_mc.good_mc._visible = false;
      root.asteroid5_mc.broken_mc._visible = true;
      root.schiff_mc.schild_mc._visible = true;
   }
   if(root.asteroid5_mc.broken_mc._visible == true && root.asteroid5_mc._alpha > 0)
   {
      root.asteroid5_mc._alpha -= root.t(7);
   }
};

root.stat = 1;
root.stat2 = 1;
root.stat3 = 1;
root.stat4 = 1;
root.stat5 = 1;
root.Sterne_mc._alpha = 88;
root.Sterne2_mc._alpha = 86;
root.Sterne3_mc._alpha = 77;
root.Sterne4_mc._alpha = 67;
root.Sterne5_mc._alpha = 89;
root.Sterne6_mc._alpha = 96;
root.Sterne7_mc._alpha = 78;
root.Sterne_mc.onEnterFrame = function()
{
   root.Sterne_mc._rotation += root.t(1);
   root.Sterne2_mc._rotation -= root.t(1);
   root.Sterne3_mc._rotation += root.t(2);
   root.Sterne4_mc._rotation -= root.t(2);
   root.Sterne5_mc._rotation += root.t(3);
   root.Sterne6_mc._rotation -= root.t(3);
   root.Sterne7_mc._rotation += root.t(4);
   if(root.Sterne7_mc._alpha <= 100)
   {
      root.Sterne7_mc._alpha -= root.t(1);
   }
   if(root.Sterne7_mc._alpha <= 5)
   {
      root.Sterne7_mc._alpha += root.t(6);
   }
   if(root.stat == 1)
   {
      root.Sterne5_mc._x += root.t(2);
      root.Sterne5_mc._y += root.t(2);
      if(root.Sterne5_mc._x >= 400 || root.Sterne5_mc._y >= 550)
      {
         root.stat = 0;
      }
   }
   else if(root.stat == 0)
   {
      root.Sterne5_mc._x -= root.t(2);
      root.Sterne5_mc._y -= root.t(2);
      if(root.Sterne5_mc._x <= 0 || root.Sterne5_mc._y <= 0)
      {
         root.stat = 1;
      }
   }
   if(root.stat2 == 1)
   {
      root.Sterne4_mc._x += root.t(1);
      root.Sterne4_mc._y += root.t(1);
      if(root.Sterne4_mc._x >= 400 || root.Sterne4_mc._y >= 550)
      {
         root.stat2 = 0;
      }
   }
   else if(root.stat2 == 0)
   {
      root.Sterne4_mc._x -= root.t(1);
      root.Sterne4_mc._y -= root.t(1);
      if(root.Sterne4_mc._x <= 0 || root.Sterne4_mc._y <= 0)
      {
         root.stat2 = 1;
      }
   }
   if(root.stat3 == 1)
   {
      root.Sterne3_mc._x += root.t(3);
      root.Sterne3_mc._y += root.t(3);
      if(root.Sterne3_mc._x >= 400 || root.Sterne3_mc._y >= 550)
      {
         root.stat3 = 0;
      }
   }
   else if(root.stat3 == 0)
   {
      root.Sterne3_mc._x -= root.t(1);
      root.Sterne3_mc._y -= root.t(1);
      if(root.Sterne3_mc._x <= 0 || root.Sterne3_mc._y <= 0)
      {
         root.stat3 = 1;
      }
   }
   if(root.stat4 == 1)
   {
      root.Sterne2_mc._x += root.t(2);
      root.Sterne2_mc._y += root.t(2);
      if(root.Sterne2_mc._x >= 400 || root.Sterne2_mc._y >= 550)
      {
         root.stat4 = 0;
      }
   }
   else if(root.stat4 == 0)
   {
      root.Sterne2_mc._x -= root.t(2);
      root.Sterne2_mc._y -= root.t(2);
      if(root.Sterne2_mc._x <= 0 || root.Sterne2_mc._y <= 0)
      {
         root.stat4 = 1;
      }
   }
   if(root.stat5 == 0)
   {
      root.Sterne_mc._x += root.t(2);
      root.Sterne_mc._y += root.t(2);
      if(root.Sterne_mc._x >= 400 || root.Sterne_mc._y >= 550)
      {
         root.stat5 = 0;
      }
   }
   else if(root.stat5 == 1)
   {
      root.Sterne_mc._x -= root.t(2);
      root.Sterne_mc._y -= root.t(2);
      if(root.Sterne_mc._x <= 0 || root.Sterne_mc._y <= 0)
      {
         root.stat5 = 1;
      }
   }
};

};
