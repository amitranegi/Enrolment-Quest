// @ts-nocheck
import { setPlayerSession, clearPlayerSession, getPlayerSession, shouldPersistPlay } from '../persistence/playerSession';
import {
  isDemoMode, setDemoMode, isDemoSkipValidation, setDemoSkipValidation, getDemoSkipValidation,
} from '../persistence/demoMode';
import { persistInterestPlay, listLocalPlays } from '../persistence/persistPlay';
import { openPlanChooser, closePlanChooser, isPlanChooserOpen } from '../enrolment/planChooser';
import { openFocusZone, closeFocusZone, isFocusZoneOpen } from '../enrolment/focusZone';
import { openAddonBazaar, closeAddonBazaar, isAddonBazaarOpen } from '../enrolment/addonBazaar';
import {
  loadSpriteManifest,
  loadAuthoredKeys as fetchAuthoredKeyBatch,
  filterManifest,
  fetchAuthoredStrip,
  fetchAuthoredImage,
  BOOT_TITLE_KEYS,
  BOOT_PLAY_KEYS,
  BOOT_DEFER_KEYS,
} from '../sprites/loadAuthored';
import { playSfx, startMusic, setMuted, isMuted } from '../audio/sfx';
import { assetPath } from '../config/assetPath';
import { cloudExportGuidance, exportEndpointReady, fetchCloudPlays } from '../api/exportPlays';
import { fetchHallOfFame } from '../api/hallOfFame';
import { applyCompanyProfile } from '../config/applyCompanyProfile';
import {
  getActiveCompany,
  getActiveCompanyId,
  listCompanies,
  setActiveCompany,
} from '../config/companies';
import { getEnemyIntro, markEnemyIntroSeen, enemyIntroSeen, resetEnemyIntroSession } from './enemyIntros';
import femaleIdleUrl from '../assets/sprites/hero/female/player_idle.png';
import femaleRunUrl from '../assets/sprites/hero/female/player_run.png';
import femaleJumpUrl from '../assets/sprites/hero/female/player_jump.png';
import femaleFocusUrl from '../assets/sprites/hero/female/focus_hero.png';
import femaleIdleArmorUrl from '../assets/sprites/hero/female/player_idle_armor.png';
import femaleRunArmorUrl from '../assets/sprites/hero/female/player_run_armor.png';
import femaleJumpArmorUrl from '../assets/sprites/hero/female/player_jump_armor.png';
import femaleIdleArmorBracersUrl from '../assets/sprites/hero/female/player_idle_armor_bracers.png';
import femaleRunArmorBracersUrl from '../assets/sprites/hero/female/player_run_armor_bracers.png';
import femaleJumpArmorBracersUrl from '../assets/sprites/hero/female/player_jump_armor_bracers.png';
import femaleIdleGearedUrl from '../assets/sprites/hero/female/player_idle_geared.png';
import femaleRunGearedUrl from '../assets/sprites/hero/female/player_run_geared.png';
import femaleJumpGearedUrl from '../assets/sprites/hero/female/player_jump_geared.png';
import femaleHeroFrontUrl from '../assets/sprites/hero/female/hero_front.png';
import maleIdleUrl from '../assets/sprites/hero/male/player_idle.png';
import maleRunUrl from '../assets/sprites/hero/male/player_run.png';
import maleJumpUrl from '../assets/sprites/hero/male/player_jump.png';
import maleFocusUrl from '../assets/sprites/hero/male/focus_hero.png';
import maleIdleArmorUrl from '../assets/sprites/hero/male/player_idle_armor.png';
import maleRunArmorUrl from '../assets/sprites/hero/male/player_run_armor.png';
import maleJumpArmorUrl from '../assets/sprites/hero/male/player_jump_armor.png';
import maleIdleArmorBracersUrl from '../assets/sprites/hero/male/player_idle_armor_bracers.png';
import maleRunArmorBracersUrl from '../assets/sprites/hero/male/player_run_armor_bracers.png';
import maleJumpArmorBracersUrl from '../assets/sprites/hero/male/player_jump_armor_bracers.png';
import maleIdleGearedUrl from '../assets/sprites/hero/male/player_idle_geared.png';
import maleRunGearedUrl from '../assets/sprites/hero/male/player_run_geared.png';
import maleJumpGearedUrl from '../assets/sprites/hero/male/player_jump_geared.png';
import maleHeroFrontUrl from '../assets/sprites/hero/male/hero_front.png';
import otherIdleUrl from '../assets/sprites/hero/other/player_idle.png';
import otherRunUrl from '../assets/sprites/hero/other/player_run.png';
import otherJumpUrl from '../assets/sprites/hero/other/player_jump.png';
import otherFocusUrl from '../assets/sprites/hero/other/focus_hero.png';
import otherIdleArmorUrl from '../assets/sprites/hero/other/player_idle_armor.png';
import otherRunArmorUrl from '../assets/sprites/hero/other/player_run_armor.png';
import otherJumpArmorUrl from '../assets/sprites/hero/other/player_jump_armor.png';
import otherIdleArmorBracersUrl from '../assets/sprites/hero/other/player_idle_armor_bracers.png';
import otherRunArmorBracersUrl from '../assets/sprites/hero/other/player_run_armor_bracers.png';
import otherJumpArmorBracersUrl from '../assets/sprites/hero/other/player_jump_armor_bracers.png';
import otherIdleGearedUrl from '../assets/sprites/hero/other/player_idle_geared.png';
import otherRunGearedUrl from '../assets/sprites/hero/other/player_run_geared.png';
import otherJumpGearedUrl from '../assets/sprites/hero/other/player_jump_geared.png';
import otherHeroFrontUrl from '../assets/sprites/hero/other/hero_front.png';
import familySpouseMaleUrl from '../assets/sprites/family/spouse_male.png';
import familySpouseFemaleUrl from '../assets/sprites/family/spouse_female.png';
import familySpouseOtherUrl from '../assets/sprites/family/spouse_other.png';
import familyChildMaleUrl from '../assets/sprites/family/child_male.png';
import familyChildFemaleUrl from '../assets/sprites/family/child_female.png';
import familyChildOtherUrl from '../assets/sprites/family/child_other.png';
import familyParentMaleUrl from '../assets/sprites/family/parent_male.png';
import familyParentFemaleUrl from '../assets/sprites/family/parent_female.png';
import familyParentOtherUrl from '../assets/sprites/family/parent_other.png';

const SCALE=2; // early — world & sprite contract (64px / 1080p)
/**
 * Soft AI world layers quarantined; chunky procedural plates are the playable path.
 * Set true once `scripts/gen_chunky_world_layers.py --install` has written public/sprites.
 */
const USE_AUTHORED_WORLD_LAYERS = true;
/** Legacy broken start PNGs (baked checkerboard) — keep listed so old files never draw. */
const QUARANTINED_LANDMARKS = new Set([]);
/** Draw scale for all gates / walk-in landmarks (~20% smaller vs authored cell). */
const LANDMARK_SCALE = 0.8;
/** Push landmarks down so feet sit into the ground tiles (logical px). */
const LANDMARK_SINK = 16;
/** Play-camera zoom — everything on screen grows; physics stay in TILE=32 space. */
const VIEW_ZOOM=1.55;
/** Characters/enemies drawn larger than tiles (feet still sit on the hitbox). */
const ACTOR_SCALE=1.65;
/** Coins / pickups / small FX. */
const ITEM_SCALE=1.4;
/** Front-facing family hierarchy relative to the main hero. */
const FAMILY_FRONT_SCALE={ spouse:0.92, parent:0.88, child:0.74 };
function familyFrontScale(member){
  if(!member || member.id==='self' || member.relation==='self') return 1;
  return FAMILY_FRONT_SCALE[member.relation] || 0.9;
}
function viewW(){ return W/VIEW_ZOOM; }
function viewH(){ return H/VIEW_ZOOM; }
/** Keep ground near the bottom of the zoomed frame. */
function camYForGround(){
  return Math.max(0, GROUND_Y + TILE*2.5 - viewH());
}
/** Logical size of a sprite frame when drawn at `scale` (ACTOR/ITEM/1). */
function spriteLogicalSize(key, scale=1){
  const d=SPRITE_DEFS[key]; if(!d) return {w:32*scale,h:32*scale};
  return { w:(d.w/RES)*scale, h:(d.h/RES)*scale };
}
/** Draw with feet anchored to (footX, footY) in world, then subtract cam. */
function drawActor(ctx, key, frame, footX, footY, camX, camY, scale, flip){
  const sz=spriteLogicalSize(key, scale);
  Sprites.draw(ctx, key, frame, footX - sz.w/2 - camX, footY - sz.h - camY, scale, flip);
}

/*═══════════════════════════════════════════════════════════════════
  1) CONFIG — everything a benefits admin would tweak lives here.
     When company APIs are ready, this whole object can be fetched from
     the server instead of being hardcoded.
═══════════════════════════════════════════════════════════════════*/
const CONFIG = {
  MODE: 'interest',
  COMPANY: 'Tarento',
  LOGO_URL: assetPath('branding/logo.png'),
  LOGO_FALLBACK_URL: assetPath('branding/logo.svg'),
  TAGLINE: 'Benefits Adventure',
  PORTAL_URL: 'https://benefits.loophealth.com/',
  PORTAL_HOST_LABEL: 'benefits.loophealth.com',
  PORTAL_QR_URL: assetPath('branding/qr_enrol_portal.png'),
  PORTAL_SUPPORT_COPY:
    'Complete enrolment on the portal to confirm the best benefits for you and your family, with full support from Loophealth.',
  PLAYS_TABLE: 'plays_tarento',
  HOF_RPC: 'hall_of_fame_tarento',
  activeCompanyId: 'tarento',
  titleSuffix: 'Tarento',
  partners: [
    { name: 'Tarento', logoUrl: assetPath('branding/tarento.png') },
    { name: 'Loophealth', logoUrl: assetPath('branding/loophealth.png') },
  ],
  dependantStructure: { spouse: 1, child: 3, parent: 2 },
  gmcPlans: [],
  addons: [],
  gtlPlans: [],
  superTopUpPlans: [],
  enableLevel4: false,
};

function applyActiveCompanyProfile(opts={ preserveMode:true, preserveLevel4:true }){
  const prevMode=CONFIG.MODE;
  const prevLevel4=CONFIG.enableLevel4;
  const profile=getActiveCompany();
  applyCompanyProfile(CONFIG, profile);
  CONFIG.activeCompanyId=profile.id;
  CONFIG.titleSuffix=profile.titleSuffix;
  CONFIG.partners=profile.partners;
  if(opts.preserveMode) CONFIG.MODE=prevMode;
  if(opts.preserveLevel4) CONFIG.enableLevel4=prevLevel4;
}

setActiveCompany('tarento');
applyActiveCompanyProfile({ preserveMode:false, preserveLevel4:false });

/*═══════════════════════════════════════════════════════════════════
  2) API HOOKUP — connect the real enrolment endpoint here.
     Called only when CONFIG.MODE === 'live'.
═══════════════════════════════════════════════════════════════════*/
async function submitEnrolmentToAPI(payload){
  // TODO (engineering): replace with a real call, e.g.
  // const res = await fetch('https://api.example.com/v1/enrolments', {
  //   method:'POST',
  //   headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer <token>' },
  //   body: JSON.stringify(payload)
  // });
  // if(!res.ok) throw new Error('Enrolment failed');
  // return await res.json();
  console.log('[live mode] would submit:', payload);
  return { ok:true, simulated:true };
}

/*═══════════════════════════════════════════════════════════════════
  3) STORAGE — safe wrapper around window.storage (artifact persistent
     storage). Falls back to in-memory if unavailable so the game
     still runs anywhere.
═══════════════════════════════════════════════════════════════════*/
const Store = {
  ok: true,
  prefix: 'eq:',
  async get(k, _shared=false){
    try{
      const v = localStorage.getItem(this.prefix+k);
      return v==null ? null : {key:k, value:v};
    }catch(e){ return null; }
  },
  async set(k, v, _shared=false){
    try{ localStorage.setItem(this.prefix+k, v); return {key:k}; }
    catch(e){ console.error('store.set',e); return null; }
  },
  async del(k, _shared=false){
    try{ localStorage.removeItem(this.prefix+k); return {key:k}; }
    catch(e){ return null; }
  },
  async list(prefix, _shared=false){
    const keys=[];
    try{
      for(let i=0;i<localStorage.length;i++){
        const full=localStorage.key(i);
        if(full && full.startsWith(this.prefix+prefix)) keys.push(full.slice(this.prefix.length));
      }
    }catch(e){}
    return {keys};
  },
};


// unique id per game session (so many tabs can play at once)
const SESSION_ID = 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const fmtINR = n => '₹' + Number(n||0).toLocaleString('en-IN');



/*═══════════════════════════════════════════════════════════════════
  4) SPRITE SYSTEM
     Every visual asset is a named "slot". Each slot has a default,
     hand-drawn pixel-art renderer. Uploading a PNG in Sprite Studio
     overrides the default and is saved on this device.
     Animated slots = 5 frames in one horizontal strip.
═══════════════════════════════════════════════════════════════════*/
const SKINS = ['#8d5524','#c68642','#e0ac69','#f1c27d','#ffdbac'];
const HAIRS = ['#241a12','#3d2b1f','#5a3825','#101018','#7a4a1e'];

const SPRITE_DEFS = {
  player_idle:  {w:64,h:64,frames:5, label:'Hero — Idle',   group:'Characters'},
  player_run:   {w:64,h:64,frames:5, label:'Hero — Run',    group:'Characters'},
  player_jump:  {w:64,h:64,frames:1, label:'Hero — Jump',   group:'Characters'},
  /** Front-facing Focus Zone portrait — replace via public/sprites/focus_hero.png (480×96 strip). */
  focus_hero:   {w:96,h:96,frames:5, label:'Hero — Focus Zone (front)', group:'Characters'},
  /** Full-body user-facing idle for title / summary — unique motions, uneven timing. */
  hero_front:   {w:96,h:96,frames:8, label:'Hero — Front showcase', group:'Characters'},
  /** Legacy fallbacks — prefer relation/gender family_* keys below. */
  family_front:       {w:64,h:64,frames:6, label:'Family — Front adult (fallback)', group:'Characters'},
  family_front_child: {w:64,h:64,frames:6, label:'Family — Front child (fallback)', group:'Characters'},
  family_spouse_male:   {w:64,h:64,frames:6, label:'Family — Spouse male', group:'Characters'},
  family_spouse_female: {w:64,h:64,frames:6, label:'Family — Spouse female', group:'Characters'},
  family_spouse_other:  {w:64,h:64,frames:6, label:'Family — Spouse other', group:'Characters'},
  family_child_male:    {w:64,h:64,frames:6, label:'Family — Child male', group:'Characters'},
  family_child_female:  {w:64,h:64,frames:6, label:'Family — Child female', group:'Characters'},
  family_child_other:   {w:64,h:64,frames:6, label:'Family — Child other', group:'Characters'},
  family_parent_male:   {w:64,h:64,frames:6, label:'Family — Parent male', group:'Characters'},
  family_parent_female: {w:64,h:64,frames:6, label:'Family — Parent female', group:'Characters'},
  family_parent_other:  {w:64,h:64,frames:6, label:'Family — Parent other', group:'Characters'},
  enemy_sneezy: {w:64,h:64,frames:5, label:'Enemy — Sneezy Sprinter',  group:'Characters'},
  enemy_bill:   {w:64,h:96,frames:5, label:'Enemy — Bill Blaster',     group:'Characters'},
  enemy_junk:   {w:64,h:64,frames:5, label:'Enemy — JunkZilla',        group:'Characters'},
  enemy_bone:   {w:64,h:80,frames:5, label:'Enemy — Bone Rattler',     group:'Characters'},
  enemy_bone_pile:{w:64,h:32,frames:1, label:'Bone Rattler — collapsed pile', group:'Characters'},
  enemy_denier: {w:64,h:80,frames:5, label:'Enemy — Claim Denier',     group:'Characters'},
  enemy_spike:  {w:64,h:64,frames:5, label:'Enemy — Premium Spike',    group:'Characters'},
  pickup_kit:   {w:40,h:40,frames:1, label:'Power-up — Seal Shot kit', group:'Items'},
  pickup_beam:  {w:40,h:40,frames:1, label:'Power-up — Coverage Beam', group:'Items'},
  pickup_shield:{w:40,h:40,frames:1, label:'Power-up — Coverage Shield', group:'Items'},
  fx_puff:      {w:32,h:32,frames:1, label:'Effect — cloud puff',      group:'Effects'},
  fx_bill:      {w:32,h:20,frames:1, label:'Effect — rolled paper bill', group:'Effects'},
  fx_splash:    {w:32,h:32,frames:1, label:'Effect — grease splash',   group:'Effects'},
  fx_bone:      {w:24,h:24,frames:1, label:'Effect — bone shard',      group:'Effects'},
  fx_seal:      {w:28,h:28,frames:1, label:'Effect — thrown wax seal', group:'Effects'},
  fx_beam:      {w:48,h:16,frames:1, label:'Effect — coverage beam bolt', group:'Effects'},
  fx_pill:      {w:28,h:16, frames:1, label:'Effect — legacy pill (unused)', group:'Effects'},
  coin:         {w:32,h:32,frames:5, label:'Coin',          group:'Items'},
  flag:         {w:64,h:128,frames:1, label:'Level Flag',    group:'Items'},
  cloud:        {w:128,h:64,frames:1, label:'Cloud',         group:'Sky'},
  bird:         {w:48,h:32,frames:5, label:'Bird (animated sky)', group:'Sky'},
  tile_top:     {w:64,h:64,frames:1, label:'Ground — grass top', group:'Terrain'},
  tile_ground:  {w:64,h:64,frames:1, label:'Ground — dirt fill', group:'Terrain'},
  tile_platform:{w:64,h:64,frames:1, label:'Floating platform',  group:'Terrain'},
  tile_brick:   {w:64,h:64,frames:1, label:'Brick — destructible', group:'Terrain'},
  tile_metal:   {w:64,h:64,frames:1, label:'Block — indestructible', group:'Terrain'},
  bg_title: {w:1920,h:1080,frames:1, label:'Background — Title screen', group:'Backgrounds'},
  bg_setup: {w:1920,h:1080,frames:1, label:'Background — Character creator',  group:'Backgrounds'},
  bg_l1:    {w:1920,h:1080,frames:1, label:'Background — Level 1',      group:'Backgrounds'},
  bg_l2:    {w:1920,h:1080,frames:1, label:'Background — Level 2',      group:'Backgrounds'},
  bg_l3:    {w:1920,h:1080,frames:1, label:'Background — Level 3',      group:'Backgrounds'},
  bg_l4:    {w:1920,h:1080,frames:1, label:'Background — Level 4',      group:'Backgrounds'},
  bg_complete:{w:1920,h:1080,frames:1, label:'Background — Quest complete', group:'Backgrounds'},

  /* Authored parallax plates (transparent sky). Native 1080p — 1 art px = 1 device px. */
  parallax_l1_far:  {w:1920,h:1080,frames:1, label:'Parallax L1 — Far hills',  group:'Parallax'},
  parallax_l1_mid:  {w:1920,h:1080,frames:1, label:'Parallax L1 — Mid hills',  group:'Parallax'},
  parallax_l1_near: {w:1920,h:1080,frames:1, label:'Parallax L1 — Near scrub', group:'Parallax'},
  parallax_l2_far:  {w:1920,h:1080,frames:1, label:'Parallax L2 — Far hills',  group:'Parallax'},
  parallax_l2_mid:  {w:1920,h:1080,frames:1, label:'Parallax L2 — Mid hills',  group:'Parallax'},
  parallax_l2_near: {w:1920,h:1080,frames:1, label:'Parallax L2 — Near scrub', group:'Parallax'},
  parallax_l3_far:  {w:1920,h:1080,frames:1, label:'Parallax L3 — Far bazaar',  group:'Parallax'},
  parallax_l3_mid:  {w:1920,h:1080,frames:1, label:'Parallax L3 — Mid stalls',  group:'Parallax'},
  parallax_l3_near: {w:1920,h:1080,frames:1, label:'Parallax L3 — Near stalls', group:'Parallax'},

  /* World-locked landmarks (do NOT tile — start/end of level only). Doorway faces LEFT. */
  landmark_l1_start:{w:384,h:448,frames:1, label:'L1 Start — Neem path gate', group:'Landmarks'},
  landmark_l1_end:  {w:384,h:448,frames:1, label:'L1 End — Family Cottage', group:'Landmarks'},
  landmark_l2_start:{w:384,h:448,frames:1, label:'L2 Start — Highland clinic gate', group:'Landmarks'},
  landmark_l2_end:  {w:384,h:448,frames:1, label:'L2 End — Hill Clinic', group:'Landmarks'},
  landmark_l3_start:{w:512,h:576,frames:1, label:'L3 Start — Bangalore bazaar gate', group:'Landmarks'},
  landmark_l3_end:  {w:512,h:576,frames:1, label:'L3 End — Garden Bazaar Pavilion', group:'Landmarks'},
};

const Sprites = {
  frames:{},      // key -> [canvas,...]
  custom:{},      // key -> true if user-uploaded (Sprite Studio)
  authored:{},    // key -> true if loaded from public/sprites
  bundled:{},     // key -> [canvas,...] preview packs (not saved to Store)
  genderPacks:{}, // gender -> { base, armor?, armor_bracers?, full? }
  familyPacks:{}, // relation -> { male, female, other } frame arrays
  showcase:{},    // title-screen defaults (e.g. hero_front before gender pick)
  showcaseTitle:{}, // higher-res front strips for crisp title lineup (128×128 cells)

  mk(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; },

  buildDefault(key){
    const d=SPRITE_DEFS[key]; const out=[];
    const hw=Math.round(d.w/SCALE), hh=Math.round(d.h/SCALE);
    for(let f=0; f<d.frames; f++){
      const tiny=this.mk(hw,hh), tx=tiny.getContext('2d');
      const artKey = key.startsWith('family_spouse_') || key.startsWith('family_parent_')
        ? 'family_front'
        : key.startsWith('family_child_')
          ? 'family_front_child'
          : key;
      const drawer = DefaultArt[artKey] || DefaultArt[key];
      if(drawer) drawer(tx, f, hw, hh);
      const c=this.mk(d.w,d.h), x=c.getContext('2d');
      x.imageSmoothingEnabled=false;
      x.drawImage(tiny, 0, 0, d.w, d.h);
      out.push(c);
    }
    this.frames[key]=out;
  },

  /**
   * Cumulative gear stage from enrolment choices.
   * base → armor (GMC) → armor_bracers (GMC+addons) → full (GMC+addons+GTL)
   */
  heroGearStage(){
    const hasGmc=!!Enrol.gmc;
    const hasAddons=!!(Enrol.addons && Enrol.addons.length);
    const hasGtl=!!Enrol.gtl;
    if(hasGmc && hasAddons && hasGtl) return 'full';
    if(hasGmc && hasAddons) return 'armor_bracers';
    if(hasGmc) return 'armor';
    return 'base';
  },

  /** @deprecated use heroGearStage() === 'full' */
  usesGearedHero(){
    return this.heroGearStage()==='full';
  },

  /** Pick best available stage pack with fallback chain. */
  stagePackFor(genderPack, stage){
    if(!genderPack) return null;
    if(stage==='base') return genderPack.base || null;
    const order = stage==='full'
      ? ['full','armor_bracers','armor','base']
      : stage==='armor_bracers'
        ? ['armor_bracers','armor','base']
        : ['armor','base'];
    for(const s of order){
      if(genderPack[s]) return genderPack[s];
    }
    return genderPack.base || null;
  },

  activeGenderPack(){
    const g=Enrol.character&&Enrol.character.gender;
    const pack=g && this.genderPacks[g];
    if(!pack) return null;
    const base=pack.base || {};
    // Benefits still upgrade mechanically, but the pilot keeps one consistent hero look.
    return {
      player_idle: base.player_idle,
      player_run: base.player_run,
      player_jump: base.player_jump,
      focus_hero: base.focus_hero,
      hero_front: base.hero_front,
      _stage: 'base',
    };
  },

  rebuildHero(){ // hero look = base gender pack. Never fall back to legacy public player_run.
    const pack=this.activeGenderPack();
    const heroKeys=['player_idle','player_run','player_jump','focus_hero','hero_front'];
    for(const key of heroKeys){
      if(this.custom[key]) continue; // Sprite Studio wins
      if(pack && pack[key]){ this.frames[key]=pack[key]; continue; }
      // Title / setup preview before gender is picked — show female pack, not procedural
      if(key==='hero_front' && this.showcase && this.showcase.female){
        this.frames.hero_front=this.showcase.female;
        continue;
      }
      if(key==='player_idle' && this.genderPacks.female?.base?.player_idle){
        this.frames.player_idle=this.genderPacks.female.base.player_idle;
        continue;
      }
      if(key==='player_run' && this.genderPacks.female?.base?.player_run){
        this.frames.player_run=this.genderPacks.female.base.player_run;
        continue;
      }
      if(key==='player_jump' && this.genderPacks.female?.base?.player_jump){
        this.frames.player_jump=this.genderPacks.female.base.player_jump;
        continue;
      }
      this.buildDefault(key);
    }
  },

  /** Resolve family front strip by relation + gender. */
  familyFramesFor(relation, gender){
    const rel = relation==='spouse' || relation==='child' || relation==='parent' ? relation : null;
    if(!rel) return null;
    const g = (gender==='male'||gender==='female'||gender==='other') ? gender : 'other';
    const pack = this.familyPacks[rel];
    if(pack){
      const hit = pack[g] || pack.other || pack.female || pack.male;
      if(hit && hit.length) return hit;
    }
    // Legacy public/sprites fallbacks
    const legacy = rel==='child' ? this.frames.family_front_child : this.frames.family_front;
    return (legacy && legacy.length) ? legacy : null;
  },

  async loadCustomAll(){
    const r = await Store.list('sprite:');
    for(const k of (r.keys||[])){
      const rec = await Store.get(k); if(!rec) continue;
      const key = k.slice(7);
      if(SPRITE_DEFS[key]) await this.applyDataURL(key, rec.value, false);
    }
  },

  decodeStrip(key, src){
    return new Promise(res=>{
      const d=SPRITE_DEFS[key]; const img=new Image();
      img.onload=()=>{
        const out=[]; const fw=img.width/d.frames;
        for(let f=0; f<d.frames; f++){
          const c=this.mk(d.w,d.h), x=c.getContext('2d');
          x.imageSmoothingEnabled=false;
          x.drawImage(img, f*fw,0,fw,img.height, 0,0,d.w,d.h);
          out.push(c);
        }
        res(out);
      };
      img.onerror=()=>res(null);
      img.src=src;
    });
  },

  /** Decode a free-size strip (title showcase) without SPRITE_DEFS sizing. */
  decodeFreeStrip(src, frames, cellW, cellH){
    return new Promise(res=>{
      const img=new Image();
      img.onload=()=>{
        const out=[]; const fw=img.width/frames;
        for(let f=0; f<frames; f++){
          const c=this.mk(cellW,cellH), x=c.getContext('2d');
          x.imageSmoothingEnabled=false;
          x.drawImage(img, f*fw,0,fw,img.height, 0,0,cellW,cellH);
          out.push(c);
        }
        res(out);
      };
      img.onerror=()=>res(null);
      img.src=src;
    });
  },

  async loadFamilyPacks(){
    const load = async (key, url)=>{
      const frames = await this.decodeStrip(key, url);
      if(frames) this.frames[key]=frames;
      return frames;
    };
    const spouse = {
      male: await load('family_spouse_male', familySpouseMaleUrl),
      female: await load('family_spouse_female', familySpouseFemaleUrl),
      other: await load('family_spouse_other', familySpouseOtherUrl),
    };
    const child = {
      male: await load('family_child_male', familyChildMaleUrl),
      female: await load('family_child_female', familyChildFemaleUrl),
      other: await load('family_child_other', familyChildOtherUrl),
    };
    const parent = {
      male: await load('family_parent_male', familyParentMaleUrl),
      female: await load('family_parent_female', familyParentFemaleUrl),
      other: await load('family_parent_other', familyParentOtherUrl),
    };
    this.familyPacks = { spouse, child, parent };
    // Keep legacy keys pointing at common defaults for older call sites / public overrides
    if(!this.authored.family_front && spouse.female) this.frames.family_front = spouse.female;
    if(!this.authored.family_front_child && child.male) this.frames.family_front_child = child.male;
  },

  async loadGenderPacks(){
    const SIDE=['player_idle','player_run','player_jump'];
    const loadStage=async (idle, run, jump)=>{
      const pack={
        player_idle: await this.decodeStrip('player_idle', idle),
        player_run: await this.decodeStrip('player_run', run),
        player_jump: await this.decodeStrip('player_jump', jump),
      };
      return SIDE.every(k=>!!pack[k]) ? pack : null;
    };
    const loadOne=async (urls)=>{
      const base={
        player_idle: await this.decodeStrip('player_idle', urls.idle),
        player_run: await this.decodeStrip('player_run', urls.run),
        player_jump: await this.decodeStrip('player_jump', urls.jump),
        focus_hero: await this.decodeStrip('focus_hero', urls.focus),
        hero_front: await this.decodeStrip('hero_front', urls.front),
      };
      const armor = await loadStage(urls.idleArmor, urls.runArmor, urls.jumpArmor);
      const armor_bracers = await loadStage(urls.idleArmorBracers, urls.runArmorBracers, urls.jumpArmorBracers);
      const full = await loadStage(urls.idleGeared, urls.runGeared, urls.jumpGeared);
      const ok=['player_idle','player_run','player_jump','focus_hero','hero_front'].every(k=>!!base[k]);
      return ok ? { base, armor, armor_bracers, full, geared: full } : null;
    };

    const packs={
      male: await loadOne({
        idle:maleIdleUrl, run:maleRunUrl, jump:maleJumpUrl, focus:maleFocusUrl, front:maleHeroFrontUrl,
        idleArmor:maleIdleArmorUrl, runArmor:maleRunArmorUrl, jumpArmor:maleJumpArmorUrl,
        idleArmorBracers:maleIdleArmorBracersUrl, runArmorBracers:maleRunArmorBracersUrl, jumpArmorBracers:maleJumpArmorBracersUrl,
        idleGeared:maleIdleGearedUrl, runGeared:maleRunGearedUrl, jumpGeared:maleJumpGearedUrl,
      }),
      female: await loadOne({
        idle:femaleIdleUrl, run:femaleRunUrl, jump:femaleJumpUrl, focus:femaleFocusUrl, front:femaleHeroFrontUrl,
        idleArmor:femaleIdleArmorUrl, runArmor:femaleRunArmorUrl, jumpArmor:femaleJumpArmorUrl,
        idleArmorBracers:femaleIdleArmorBracersUrl, runArmorBracers:femaleRunArmorBracersUrl, jumpArmorBracers:femaleJumpArmorBracersUrl,
        idleGeared:femaleIdleGearedUrl, runGeared:femaleRunGearedUrl, jumpGeared:femaleJumpGearedUrl,
      }),
      other: await loadOne({
        idle:otherIdleUrl, run:otherRunUrl, jump:otherJumpUrl, focus:otherFocusUrl, front:otherHeroFrontUrl,
        idleArmor:otherIdleArmorUrl, runArmor:otherRunArmorUrl, jumpArmor:otherJumpArmorUrl,
        idleArmorBracers:otherIdleArmorBracersUrl, runArmorBracers:otherRunArmorBracersUrl, jumpArmorBracers:otherJumpArmorBracersUrl,
        idleGeared:otherIdleGearedUrl, runGeared:otherRunGearedUrl, jumpGeared:otherJumpGearedUrl,
      }),
    };

    for(const g of Object.keys(packs)){
      if(packs[g]) this.genderPacks[g]=packs[g];
      else console.warn('[sprites] gender pack incomplete:', g);
    }
    // Title lineup: use clean 96×96 fronts (hero_front_title PNGs have baked AA/ghost fringe).
    this.showcase={
      male: this.genderPacks.male?.base?.hero_front || null,
      female: this.genderPacks.female?.base?.hero_front || null,
      other: this.genderPacks.other?.base?.hero_front || null,
    };
    this.showcaseTitle={
      male: this.showcase.male,
      female: this.showcase.female,
      other: this.showcase.other,
    };
  },

  /** Load PNG strips from public/sprites/{key}.png — overrides DefaultArt, not Studio customs. */
  async loadAuthoredKeys(keys, onProgress){
    const skipHero = new Set(['player_idle','player_run','player_jump','focus_hero','hero_front']);
    const skipWorld = (key)=>!USE_AUTHORED_WORLD_LAYERS && (
      key==='bg_l1' || key==='bg_l2' || key==='bg_l3' ||
      key.startsWith('parallax_l1_') || key.startsWith('parallax_l2_') || key.startsWith('parallax_l3_') ||
      QUARANTINED_LANDMARKS.has(key)
    );
    const want = keys.filter(k=>!skipHero.has(k) && !skipWorld(k) && SPRITE_DEFS[k]);
    return fetchAuthoredKeyBatch(want, async (key, img)=>{
      if(this.custom[key]) return false; // Studio wins
      const ok = await this.applyImage(key, img, false);
      if(ok){ this.authored[key]=true; delete this.custom[key]; }
      return ok;
    }, onProgress, 8);
  },

  /** Decode an already-fetched HTMLImageElement into sprite frames. */
  applyImage(key, img, save=false){
    return new Promise(res=>{
      const d=SPRITE_DEFS[key];
      if(!d || !img){ res(false); return; }
      try{
        const out=[]; const fw=img.width/d.frames;
        for(let f=0; f<d.frames; f++){
          const c=this.mk(d.w,d.h), x=c.getContext('2d');
          x.imageSmoothingEnabled=false;
          x.drawImage(img, f*fw,0,fw,img.height, 0,0,d.w,d.h);
          out.push(c);
        }
        this.frames[key]=out;
        if(save) this.custom[key]=true;
        res(true);
      }catch(e){ res(false); }
    });
  },

  applyDataURL(key, dataURL, save=true){
    return new Promise(res=>{
      const d=SPRITE_DEFS[key]; const img=new Image();
      img.onload=async ()=>{
        const ok = await this.applyImage(key, img, false);
        if(ok){
          this.custom[key]=true;
          if(save) await Store.set('sprite:'+key, dataURL);
        }
        res(ok);
      };
      img.onerror=()=>res(false);
      img.src=dataURL;
    });
  },

  async reset(key){
    delete this.custom[key];
    await Store.del('sprite:'+key);
    const img = await fetchAuthoredImage(key);
    if(img){
      const ok = await this.applyImage(key, img, false);
      if(ok){ this.authored[key]=true; delete this.custom[key]; return; }
    }
    const dataURL = await fetchAuthoredStrip(key);
    if(dataURL){
      const ok = await this.applyDataURL(key, dataURL, false);
      if(ok){ this.authored[key]=true; delete this.custom[key]; return; }
    }
    delete this.authored[key];
    this.buildDefault(key);
  },

  /* x/y/scale are in logical units; frames are RES× so divide to land 1 art
     pixel on 1 device pixel. Snapping happens on the device grid. */
  draw(ctx, key, frame, x, y, scale=1, flip=false){
    const arr=this.frames[key]; if(!arr) return;
    const c=arr[frame % arr.length];
    const s=(scale||1)/RES;
    const sx=Math.round(x*RES)/RES, sy=Math.round(y*RES)/RES;
    ctx.save(); ctx.imageSmoothingEnabled=false;
    if(flip){ ctx.translate(sx+c.width*s, sy); ctx.scale(-s,s); }
    else{ ctx.translate(sx, sy); ctx.scale(s,s); }
    ctx.drawImage(c,0,0);
    ctx.restore();
  },

  /** Soft storybook props (landmarks) — smooth blit; tiles/actors stay crisp via draw(). */
  drawSoft(ctx, key, frame, x, y, scale=1, flip=false){
    const arr=this.frames[key]; if(!arr) return;
    const c=arr[frame % arr.length];
    const s=(scale||1)/RES;
    const sx=Math.round(x*RES)/RES, sy=Math.round(y*RES)/RES;
    ctx.save();
    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality='high';
    if(flip){ ctx.translate(sx+c.width*s, sy); ctx.scale(-s,s); }
    else{ ctx.translate(sx, sy); ctx.scale(s,s); }
    ctx.drawImage(c,0,0);
    ctx.restore();
  },
};

/* ---------- default pixel-art renderers ---------- */
function px(x,c,a,b,w,h){ x.fillStyle=c; x.fillRect(a,b,w,h); }

function drawHero(x, f, pose){
  const ch = Enrol.character;
  const skin = SKINS[ch.skin ?? 2];
  const hair = HAIRS[ch.skin ?? 2] || '#241a12';
  const g = ch.gender || 'male';
  const shirt = g==='female' ? '#e0559a' : (g==='other' ? '#3fbf8f' : '#4a6cd4');
  const pants = '#2b2b3d';
  const bobs = [0,0,1,1,0];
  const bob = pose==='idle' ? bobs[f] : 0;
  const legA = pose==='run' ? [0,3,5,3,0][f] : 0;   // stride
  const legB = pose==='run' ? [5,3,0,3,5][f] : 0;
  const jump = pose==='jump';

  // legs
  px(x,pants, 11, 24+bob - (jump?2:0), 4, 7 - (jump?2:legA*0.6));
  px(x,pants, 17, 24+bob - (jump?2:0), 4, 7 - (jump?2:legB*0.6));
  px(x,'#1a1a26', 10, 30+bob, 5, 2); px(x,'#1a1a26', 17, 30+bob, 5, 2); // shoes
  // torso
  px(x,shirt, 9, 15+bob, 14, 10);
  // arms
  if(jump){ px(x,shirt, 6, 9, 3, 7); px(x,shirt, 23, 9, 3, 7); px(x,skin,6,7,3,3); px(x,skin,23,7,3,3); }
  else{
    const sw = pose==='run' ? [2,1,0,1,2][f] : 0;
    px(x,shirt, 6, 16+bob+sw, 3, 7); px(x,shirt, 23, 16+bob-sw, 3, 7);
    px(x,skin, 6, 22+bob+sw, 3, 3); px(x,skin, 23, 22+bob-sw, 3, 3);
  }
  // head
  px(x,skin, 10, 4+bob, 12, 11);
  // hair styles
  px(x,hair, 9, 3+bob, 14, 4);
  if(g==='female'){ px(x,hair, 8, 5+bob, 3, 12); px(x,hair, 21, 5+bob, 3, 12); }
  if(g==='other'){ px(x,'#b05ce0', 9, 2+bob, 14, 3); }
  // face
  px(x,'#101018', 13, 9+bob, 2, 2); px(x,'#101018', 18, 9+bob, 2, 2);
  px(x,'#8d3b3b', 14, 13+bob, 4, 1);
  if((ch.age||25) >= 50){ x.strokeStyle='#101018'; x.strokeRect(12.5,8.5+bob,3,3); x.strokeRect(17.5,8.5+bob,3,3); }
}

/** Front-facing Focus Zone hero (48×48 logical → scaled to 96×96). Subtle idle bob only. */
function drawHeroFront(x, f){
  const ch = Enrol.character;
  const skin = SKINS[ch.skin ?? 2];
  const hair = HAIRS[ch.skin ?? 2] || '#241a12';
  const g = ch.gender || 'male';
  const shirt = g==='female' ? '#e0559a' : (g==='other' ? '#3fbf8f' : '#4a6cd4');
  const pants = '#2b2b3d';
  const bob = [0,0,1,1,0][f%5];           // low-amplitude breathe
  const arm = [0,0,1,0,0][f%5];           // tiny arm settle
  // ground shadow
  px(x,'#0a1210', 12, 45, 24, 2);
  // legs — two columns facing camera
  px(x,pants, 15, 33+bob, 7, 11);
  px(x,pants, 26, 33+bob, 7, 11);
  px(x,'#1a1a26', 14, 43+bob, 9, 3);
  px(x,'#1a1a26', 25, 43+bob, 9, 3);
  // torso (square to camera)
  px(x,shirt, 13, 18+bob, 22, 16);
  px(x,'#101018', 23, 18+bob, 2, 16); // center seam hint
  // arms hanging at both sides (symmetric = front)
  px(x,shirt, 8, 19+bob+arm, 5, 13);
  px(x,shirt, 35, 19+bob-arm, 5, 13);
  px(x,skin, 8, 31+bob+arm, 5, 4);
  px(x,skin, 35, 31+bob-arm, 5, 4);
  // head facing camera
  px(x,skin, 14, 4+bob, 20, 15);
  // hair bangs across forehead
  px(x,hair, 13, 2+bob, 22, 6);
  if(g==='female'){ px(x,hair, 11, 6+bob, 4, 14); px(x,hair, 33, 6+bob, 4, 14); }
  if(g==='other'){ px(x,'#b05ce0', 13, 1+bob, 22, 4); }
  // both eyes clearly facing us
  px(x,'#ffffff', 18, 10+bob, 5, 5);
  px(x,'#ffffff', 27, 10+bob, 5, 5);
  px(x,'#101018', 20, 12+bob, 2, 2);
  px(x,'#101018', 29, 12+bob, 2, 2);
  // nose + mouth
  px(x,'#c68642', 23, 15+bob, 2, 2);
  px(x,'#8d3b3b', 21, 18+bob, 6, 2);
  if((ch.age||25) >= 50){
    x.strokeStyle='#101018'; x.lineWidth=1;
    x.strokeRect(17.5,9.5+bob,6,6); x.strokeRect(26.5,9.5+bob,6,6);
  }
}

const DefaultArt = {
  player_idle:(x,f)=>drawHero(x,f,'idle'),
  player_run:(x,f)=>drawHero(x,f,'run'),
  player_jump:(x,f)=>drawHero(x,f,'jump'),
  focus_hero:(x,f)=>drawHeroFront(x,f),
  hero_front:(x,f)=>{
    // procedural full-body front placeholder (96 logical via SCALE upscale)
    drawHeroFront(x, f%5);
    // legs under torso
    const bob=[0,0,1,1,0,0,1,0][f%8];
    px(x,'#2b2b3d', 18, 36+bob, 6, 10); px(x,'#2b2b3d', 28, 36+bob, 6, 10);
    px(x,'#1a1a26', 17, 45+bob, 7, 3); px(x,'#1a1a26', 28, 45+bob, 7, 3);
    // occasional wave
    if(f===4||f===5){ px(x,'#e0ac69', 40, 8, 5, 5); px(x,'#4a6cd4', 40, 12, 5, 10); }
  },
  family_front:(x,f)=>{
    const bob=[0,0,1,1,0,1][f%6];
    const wave=f===2||f===3;
    px(x,'#2b2b3d', 10, 22+bob, 5, 10); px(x,'#2b2b3d', 17, 22+bob, 5, 10);
    px(x,'#4a6cd4', 8, 12+bob, 16, 12);
    px(x,'#e0ac69', 9, 2+bob, 14, 12);
    px(x,'#241a12', 8, 1+bob, 16, 4);
    px(x,'#101018', 12, 7+bob, 2, 2); px(x,'#101018', 18, 7+bob, 2, 2);
    px(x,'#e0ac69', 5, 14+bob, 3, 8);
    if(wave) px(x,'#e0ac69', 24, 4+bob, 3, 10); else px(x,'#e0ac69', 24, 14+bob, 3, 8);
  },
  family_front_child:(x,f)=>{
    const bob=[0,1,1,0,0,1][f%6];
    px(x,'#2b2b3d', 11, 20+bob, 4, 8); px(x,'#2b2b3d', 17, 20+bob, 4, 8);
    px(x,'#5cc8ff', 10, 12+bob, 12, 10);
    px(x,'#e0ac69', 11, 4+bob, 10, 9);
    px(x,'#241a12', 10, 3+bob, 12, 3);
    px(x,'#101018', 13, 8+bob, 2, 2); px(x,'#101018', 17, 8+bob, 2, 2);
    const hop=f%3===0;
    px(x,'#e0ac69', 7, 12+bob-(hop?2:0), 3, 7);
    px(x,'#e0ac69', 22, 12+bob-(hop?2:0), 3, 7);
  },

  /* --- Sneezy Sprinter: teal jelly blob, red nose, tiny hanky --- */
  enemy_sneezy:(x,f)=>{
    const sq=[0,1,2,1,0][f];                            // gentle wobble
    px(x,'#3fc9c0', 5, 10+sq, 22, 18-sq);               // jelly body
    px(x,'#2ea8a0', 5, 10+sq, 22, 3);                   // top shade
    px(x,'#63e0d8', 7, 13+sq, 5, 4);                    // shine
    px(x,'#fff', 10, 15+sq, 4, 4); px(x,'#fff', 19, 15+sq, 4, 4);   // friendly eyes
    px(x,'#101018', 11, 16+sq, 2, 2); px(x,'#101018', 20, 16+sq, 2, 2);
    px(x,'#ff5d6c', 14, 19+sq, 5, 4);                   // red nose
    px(x,'#ffffff', 24, 18+sq, 6, 7);                   // tiny handkerchief
    px(x,'#e8e8f4', 24, 18+sq, 6, 2);
    const st=[0,2,4,2,0][f];
    px(x,'#2ea8a0', 7+st, 27, 6, 3); px(x,'#2ea8a0', 19-st, 27, 6, 3);  // feet
  },
  /* --- Bill Blaster: stack of hospital bills with rupee marks --- */
  enemy_bill:(x,f)=>{
    const lean=[0,1,2,1,0][f];
    const paper=(yy,ww,c)=>{ px(x,c, 8+lean, yy, ww, 9); px(x,'#c8c2b0', 8+lean, yy+7, ww, 2); };
    paper(37,16,'#f4eeda'); paper(28,17,'#efe7cf'); paper(19,16,'#f4eeda'); paper(10,17,'#efe7cf');
    x.fillStyle='#8a2f2f'; x.font='bold 7px monospace'; x.textAlign='center';
    x.fillText('\u20B9', 16+lean, 26); x.fillText('\u20B9', 16+lean, 44);
    px(x,'#fff', 11+lean, 12, 4, 4); px(x,'#fff', 18+lean, 12, 4, 4);   // googly eyes
    px(x,'#101018', 12+lean, 13, 2, 2); px(x,'#101018', 19+lean, 13, 2, 2);
    px(x,'#8a2f2f', 13+lean, 3, 8, 6);                   // "PAID?" stamp hat
    px(x,'#f4eeda', 14+lean, 4, 6, 3);
  },
  /* --- JunkZilla: burger + pizza-slice hat + fries --- */
  enemy_junk:(x,f)=>{
    const sq=[0,1,0,1,0][f];
    px(x,'#ffd24a', 12, 1+sq, 3, 8); px(x,'#ffd24a', 16, 0+sq, 3, 9); px(x,'#ffd24a', 20, 2+sq, 3, 7); // fries
    x.fillStyle='#e8a13c';                              // pizza slice hat
    x.beginPath(); x.moveTo(6,10+sq); x.lineTo(26,10+sq); x.lineTo(16,3+sq); x.closePath(); x.fill();
    px(x,'#c23b3b', 11, 7+sq, 3, 2); px(x,'#c23b3b', 19, 8+sq, 3, 2);   // pepperoni
    px(x,'#e8a13c', 5, 12+sq, 22, 5);                   // top bun
    px(x,'#5fae3f', 4, 17+sq, 24, 3);                   // lettuce
    px(x,'#7a4326', 5, 20+sq, 22, 5);                   // patty
    px(x,'#e8a13c', 5, 25+sq, 22, 4);                   // bottom bun
    px(x,'#fff', 9, 13+sq, 4, 4); px(x,'#fff', 19, 13+sq, 4, 4);
    px(x,'#101018', 10, 14+sq, 2, 2); px(x,'#101018', 20, 14+sq, 2, 2);
    px(x,'#ffe9a8', 7, 21+sq, 2, 2); px(x,'#ffe9a8', 23, 22+sq, 2, 2);  // grease shine
  },
  /* --- Bone Rattler: cute skeleton with a cast on one arm --- */
  enemy_bone:(x,f)=>{
    const stp=[0,1,2,1,0][f];
    px(x,'#f2f2f8', 10, 2, 12, 10);                     // skull
    px(x,'#101018', 12, 5, 3, 3); px(x,'#101018', 18, 5, 3, 3);
    px(x,'#101018', 14, 9, 4, 1);                        // smile
    px(x,'#dcdce8', 15, 12, 2, 3);                       // neck
    px(x,'#f2f2f8', 11, 15, 10, 3);                      // ribs
    px(x,'#f2f2f8', 12, 20, 8, 3);
    px(x,'#f2f2f8', 13, 25, 6, 2);
    px(x,'#f2f2f8', 7, 15, 3, 9);                        // left arm (bone)
    px(x,'#5cc8ff', 22, 15, 5, 10);                      // right arm CAST
    px(x,'#3f9ad4', 22, 19, 5, 2);
    px(x,'#f2f2f8', 12, 28+ (stp>0?1:0), 3, 10-stp);     // legs step
    px(x,'#f2f2f8', 18, 28+ (stp>1?1:0), 3, 8+ (stp>1?2:0));
  },
  enemy_bone_pile:(x)=>{
    px(x,'#f2f2f8', 4, 10, 24, 5);                       // mound
    px(x,'#dcdce8', 7, 7, 8, 4); px(x,'#dcdce8', 18, 8, 7, 3);
    px(x,'#f2f2f8', 12, 2, 9, 7);                        // skull on top
    px(x,'#101018', 14, 4, 2, 2); px(x,'#101018', 18, 4, 2, 2);
    px(x,'#5cc8ff', 24, 11, 5, 4);                       // the cast survives
  },
  /* --- Claim Denier: walking clipboard of rejected claims (same paper family as Bill) --- */
  enemy_denier:(x,f)=>{
    const bob=[0,1,2,1,0][f];
    // clipboard back (soft slate, not metal)
    px(x,'#6a7a9a', 5, 6+bob, 18, 28);
    px(x,'#8a9ab8', 5, 6+bob, 18, 3);                   // top shade
    // cream claim forms stacked (Bill palette)
    px(x,'#f4eeda', 7, 10+bob, 14, 22);
    px(x,'#efe7cf', 7, 10+bob, 14, 2);
    px(x,'#c8c2b0', 8, 14+bob, 12, 1);                   // form lines
    px(x,'#c8c2b0', 8, 17+bob, 10, 1);
    px(x,'#c8c2b0', 8, 20+bob, 11, 1);
    // big friendly DENIED stamp blot (like Bill's PAID hat)
    px(x,'#ff5d6c', 8, 22+bob, 12, 7);
    px(x,'#f4eeda', 10, 24+bob, 8, 3);
    // gold clip hat
    px(x,'#ffd24a', 10, 2+bob, 8, 5);
    px(x,'#b8860b', 12, 3+bob, 4, 3);
    // googly eyes (same recipe as Sneezy / Bill)
    px(x,'#fff', 9, 12+bob, 4, 4); px(x,'#fff', 16, 12+bob, 4, 4);
    px(x,'#101018', 10, 13+bob, 2, 2); px(x,'#101018', 17, 13+bob, 2, 2);
    // tiny frown
    px(x,'#8a2f2f', 12, 18+bob, 5, 1);
    // front "shield" = raised rubber stamp pad held out (reads as block)
    px(x,'#ff5d6c', 22, 14+bob, 7, 12);
    px(x,'#ffb0ba', 23, 16+bob, 5, 8);
    px(x,'#f4eeda', 24, 18+bob, 3, 3);
    // soft feet wobble
    const st=[0,2,4,2,0][f];
    px(x,'#6a7a9a', 7+st, 34, 6, 3); px(x,'#6a7a9a', 16-st, 34, 6, 3);
  },
  /* --- Premium Spike: chubby gold premium-tag with a pointy hike spike --- */
  enemy_spike:(x,f)=>{
    const sq=[0,1,2,1,0][f];
    // round tag body (gold coin family)
    px(x,'#ffd24a', 5, 12+sq, 22, 16);
    px(x,'#e8b820', 5, 12+sq, 22, 3);                   // top shade
    px(x,'#ffe9a8', 8, 15+sq, 5, 4);                    // shine (Junk-style)
    // hole punch on tag
    px(x,'#f4eeda', 7, 14+sq, 4, 4);
    px(x,'#c8a24a', 8, 15+sq, 2, 2);
    // ₹ mark on belly (Bill echo)
    x.fillStyle='#8a2f2f'; x.font='bold 8px monospace'; x.textAlign='center';
    x.fillText('\u20B9', 18, 25+sq);
    // pointy "premium hike" spike hat (cute cone, not crate)
    px(x,'#ff5d6c', 14, 2+sq, 4, 11);
    px(x,'#ff5d6c', 12, 6+sq, 8, 4);
    px(x,'#ffb0ba', 15, 3+sq, 2, 6);
    // googly eyes
    px(x,'#fff', 11, 16+sq, 4, 4); px(x,'#fff', 18, 16+sq, 4, 4);
    px(x,'#101018', 12, 17+sq, 2, 2); px(x,'#101018', 19, 17+sq, 2, 2);
    // little grin
    px(x,'#8a2f2f', 14, 22+sq, 5, 1);
    // stubby feet
    const st=[0,2,3,2,0][f];
    px(x,'#e8b820', 8+st, 28, 6, 3); px(x,'#e8b820', 18-st, 28, 6, 3);
  },
  /* --- power-up + shared effects --- */
  pickup_kit:(x)=>{
    // Seal Shot kit — cream stamp pad + red wax seal (kit silhouette like old pickup)
    px(x,'#f4eeda', 1, 8, 18, 10);                      // pad body
    px(x,'#efe7cf', 1, 8, 18, 2);
    px(x,'#c8c2b0', 1, 16, 18, 2);
    px(x,'#ffd24a', 7, 5, 6, 4);                        // handle (gold like old kit)
    px(x,'#ff5d6c', 5, 10, 10, 8);                      // wax seal
    px(x,'#ffb0ba', 7, 12, 6, 4);
    px(x,'#ffd24a', 8, 13, 4, 2);                       // emboss
  },
  pickup_beam:(x)=>{
    // Coverage Beam — cute teal flashlight / claim lamp (cast-blue family)
    px(x,'#f4eeda', 5, 2, 10, 12);                      // cream body
    px(x,'#efe7cf', 5, 2, 10, 2);
    px(x,'#5cc8ff', 3, 13, 14, 5);                      // glow lens
    px(x,'#b8fff8', 5, 14, 10, 3);
    px(x,'#fff', 7, 15, 6, 1);
    px(x,'#ffd24a', 8, 5, 4, 4);                        // gold switch
    px(x,'#101018', 9, 6, 2, 2);
  },
  pickup_shield:(x)=>{
    // Coverage Shield — round cream badge with blue rim (coin-adjacent cute)
    px(x,'#5cc8ff', 3, 1, 14, 17);                      // outer rim
    px(x,'#3f9ad4', 3, 1, 14, 3);
    px(x,'#f4eeda', 5, 4, 10, 12);                      // cream face
    px(x,'#ffd24a', 8, 7, 4, 6);                        // gold chevron
    px(x,'#fff', 7, 6, 2, 2); px(x,'#fff', 11, 6, 2, 2); // tiny sparkle eyes
  },
  fx_puff:(x)=>{
    x.fillStyle='rgba(240,244,255,.92)';
    x.beginPath(); x.arc(5,10,4,0,7); x.arc(10,7,5,0,7); x.arc(12,11,4,0,7); x.fill();
  },
  fx_bill:(x)=>{
    px(x,'#f4eeda', 1, 2, 14, 6);                        // rolled bill
    px(x,'#c8c2b0', 1, 2, 14, 2);
    px(x,'#8a2f2f', 6, 3, 4, 4);                         // band
    px(x,'#efe7cf', 13, 1, 3, 8);                        // roll end
  },
  fx_splash:(x)=>{
    x.fillStyle='#e8a13c';
    x.beginPath(); x.arc(8,9,5,0,7); x.fill();
    px(x,'#e8a13c', 2, 3, 3, 3); px(x,'#e8a13c', 12, 2, 3, 3); px(x,'#e8a13c', 13, 12, 2, 2);
    px(x,'#ffd27a', 6, 7, 3, 3);
  },
  fx_bone:(x)=>{
    px(x,'#f2f2f8', 4, 2, 3, 3); px(x,'#f2f2f8', 8, 2, 3, 3);   // knobs
    px(x,'#f2f2f8', 5, 4, 5, 5);
    px(x,'#f2f2f8', 2, 8, 3, 3); px(x,'#f2f2f8', 9, 8, 3, 3);
  },
  fx_seal:(x)=>{
    // thrown wax seal — chunky round stamp (same red as Sneezy nose / DENIED)
    px(x,'#ff5d6c', 1, 1, 12, 12);
    px(x,'#ffb0ba', 3, 3, 8, 8);
    px(x,'#f4eeda', 5, 5, 4, 4);                         // cream emboss center
    px(x,'#ffd24a', 6, 6, 2, 2);
  },
  fx_beam:(x)=>{
    // coverage bolt — rolled teal ribbon (same construction as fx_bill)
    px(x,'#5cc8ff', 1, 3, 20, 6);
    px(x,'#3f9ad4', 1, 3, 20, 2);
    px(x,'#b8fff8', 4, 5, 12, 2);
    px(x,'#ffd24a', 8, 4, 5, 4);                         // gold band
    px(x,'#8af0ff', 20, 2, 4, 8);                        // glow tip
  },
  fx_pill:(x)=>{
    DefaultArt.fx_seal(x);
  },
  coin:(x,f)=>{
    const w=[12,8,4,8,12][f];
    x.fillStyle='#ffd24a'; x.beginPath();
    x.ellipse(8,8,w/2,7,0,0,Math.PI*2); x.fill();
    if(w>6){ x.fillStyle='#b8860b'; x.fillRect(7,4,2,8); }
    x.strokeStyle='#8a6508'; x.stroke();
  },


  flag:(x)=>{
    px(x,'#cfd6e4', 14, 0, 4, 64);
    px(x,'#ffd24a', 12, 0, 8, 4);
    px(x,'#5fe08a', 18, 4, 14, 12);
    px(x,'#3daf66', 18, 4, 14, 3);
  },

  cloud:(x)=>{
    x.fillStyle='rgba(255,255,255,.92)';
    x.beginPath();
    x.ellipse(20,20,14,9,0,0,7); x.ellipse(36,16,15,11,0,0,7); x.ellipse(50,21,12,8,0,0,7);
    x.fill();
  },

  bird:(x,f)=>{
    const wing=[-5,-2,0,-2,-5][f];
    px(x,'#2b2b3d', 8, 7, 10, 4);
    px(x,'#2b2b3d', 16, 6, 4, 3); px(x,'#ffb24a', 20, 7, 3, 2);
    x.fillStyle='#40405c';
    x.beginPath(); x.moveTo(12,8); x.lineTo(6,8+wing); x.lineTo(14,9); x.fill();
    x.beginPath(); x.moveTo(14,8); x.lineTo(20,8+wing); x.lineTo(15,9); x.fill();
  },

  tile_top:(x)=>{
    px(x,'#7a4b2c', 0,0,32,32);
    px(x,'#5fae4a', 0,0,32,8); px(x,'#7ed163', 0,0,32,3);
    px(x,'#4c8f3c', 4,6,4,2); px(x,'#4c8f3c', 16,5,5,2); px(x,'#4c8f3c', 26,6,3,2);
    px(x,'#684026', 6,14,5,4); px(x,'#684026', 20,22,6,4); px(x,'#8a5834', 12,26,4,3);
  },
  tile_ground:(x)=>{
    px(x,'#6a4126', 0,0,32,32);
    px(x,'#5a3620', 3,4,6,4); px(x,'#7a4b2c', 18,8,7,5);
    px(x,'#5a3620', 10,18,6,5); px(x,'#7a4b2c', 24,22,5,4); px(x,'#5a3620', 2,26,7,4);
  },
  tile_platform:(x)=>{
    px(x,'#9a6b3a', 0,4,32,24);
    px(x,'#c08b4e', 0,4,32,5); px(x,'#6f4b28', 0,24,32,4);
    px(x,'#7d5630', 8,10,2,14); px(x,'#7d5630', 22,10,2,14);
  },
  tile_brick:(x)=>{
    x.fillStyle='#b5563a'; x.fillRect(0,0,32,32);
    x.fillStyle='#8f3f2a';
    x.fillRect(0,7,32,2); x.fillRect(0,16,32,2); x.fillRect(0,25,32,2);
    x.fillRect(8,0,2,7); x.fillRect(24,0,2,7);
    x.fillRect(16,9,2,7); x.fillRect(4,18,2,7); x.fillRect(20,18,2,7); x.fillRect(12,27,2,5);
    x.fillStyle='#d97a55'; x.fillRect(0,0,32,2); x.fillRect(0,9,32,1); x.fillRect(0,18,32,1);
    x.strokeStyle='#5e2a1c'; x.strokeRect(0.5,0.5,31,31);
  },
  tile_metal:(x)=>{
    x.fillStyle='#7f8699'; x.fillRect(0,0,32,32);
    x.fillStyle='#a8afc4'; x.fillRect(2,2,28,4); x.fillRect(2,2,4,28);
    x.fillStyle='#565c6e'; x.fillRect(26,4,4,26); x.fillRect(4,26,26,4);
    x.fillStyle='#dfe3f0';
    [[5,5],[24,5],[5,24],[24,24]].forEach(r=>{x.fillRect(r[0],r[1],3,3);});
    x.strokeStyle='#33384a'; x.strokeRect(0.5,0.5,31,31);
  },
};

function skyBG(x, top, bottom, hills, accent, withHills, w, h){
  w=w||480; h=h||270;
  const g=x.createLinearGradient(0,0,0,h);
  g.addColorStop(0,top); g.addColorStop(1,bottom);
  x.fillStyle=g; x.fillRect(0,0,w,h);
  // sun / moon
  const sx=w*0.83, sy=h*0.15, sr=Math.max(12, h*0.08);
  x.fillStyle='rgba(255,255,220,.9)'; x.beginPath(); x.arc(sx,sy,sr,0,7); x.fill();
  x.fillStyle='rgba(255,255,255,.25)'; x.beginPath(); x.arc(sx,sy,sr*1.3,0,7); x.fill();
  if(withHills){
    x.fillStyle=hills;
    x.beginPath(); x.moveTo(0,h);
    for(let i=0;i<=w;i+=8){ x.lineTo(i, h*0.78 - Math.sin(i/60)*22 - Math.sin(i/23)*8); }
    x.lineTo(w,h); x.fill();
    x.fillStyle=accent;
    x.beginPath(); x.moveTo(0,h);
    for(let i=0;i<=w;i+=8){ x.lineTo(i, h*0.89 - Math.sin(i/40+2)*16); }
    x.lineTo(w,h); x.fill();
  }
}
DefaultArt.bg_title=(x,f,w,h)=>{ skyBG(x,'#5ec8f0','#b8e8ff','#6ab858','#5a9a40',true,w,h);
  x.fillStyle='rgba(255,255,255,.95)';
  x.beginPath(); x.ellipse((w||480)*0.19,(h||270)*0.26,(w||480)*0.1,(h||270)*0.07,0,0,7); x.fill();
  x.fillStyle='#ffe566'; x.beginPath(); x.arc((w||480)*0.88,(h||270)*0.16,Math.max(10,(h||270)*0.09),0,7); x.fill();
};
DefaultArt.bg_setup=(x,f,w,h)=>skyBG(x,'#67c6ff','#cfeeff','#59a86e','#3f8a56',true,w,h);
DefaultArt.bg_l1  =(x,f,w,h)=>skyBG(x,'#5cc8ff','#c6f0ff',null,null,false,w,h);
DefaultArt.bg_l2  =(x,f,w,h)=>skyBG(x,'#4aa8e8','#ffe9b8',null,null,false,w,h);
DefaultArt.bg_l3  =(x,f,w,h)=>skyBG(x,'#ff9e5c','#ffd9a8',null,null,false,w,h);
DefaultArt.bg_l4  =(x,f,w,h)=>skyBG(x,'#31356e','#8a6fd4',null,null,false,w,h);
DefaultArt.bg_complete=(x,f,w,h)=>skyBG(x,'#67c6ff','#ffe4c4','#59a86e','#3f8a56',true,w,h);
/* Transparent placeholders — real art comes from public/sprites or Studio. */
DefaultArt.parallax_l1_far  =()=>{};
DefaultArt.parallax_l1_mid  =()=>{};
DefaultArt.parallax_l1_near =()=>{};
DefaultArt.parallax_l2_far  =()=>{};
DefaultArt.parallax_l2_mid  =()=>{};
DefaultArt.parallax_l2_near =()=>{};
DefaultArt.parallax_l3_far  =()=>{};
DefaultArt.parallax_l3_mid  =()=>{};
DefaultArt.parallax_l3_near =()=>{};
DefaultArt.landmark_l1_start=()=>{};
DefaultArt.landmark_l1_end  =()=>{};
DefaultArt.landmark_l2_start=()=>{};
DefaultArt.landmark_l2_end  =()=>{};
DefaultArt.landmark_l3_start=()=>{};
DefaultArt.landmark_l3_end  =()=>{};

/* ---------- Multi-layer parallax scenery (seamless) ----------
   Each layer is a 960px-wide canvas whose hill waves complete WHOLE
   cycles across the width (k = integer), so tiling never shows a seam.
   Authored PNGs (parallax_<levelId>_far/mid/near) replace procedural
   hills when all three slots are loaded. */
function hillLayer(color, base, waves, deco){
  const w=960, h=540;
  const cv=document.createElement('canvas'); cv.width=w*RES; cv.height=h*RES;
  const x=cv.getContext('2d'); x.scale(RES,RES);
  const yAt=i=>{ let y=base; for(const wv of waves) y -= wv.a*(Math.sin(2*Math.PI*wv.k*i/w + wv.p)+1)/2; return y; };
  x.fillStyle=color; x.beginPath(); x.moveTo(0,h);
  for(let i=0;i<=w;i+=4) x.lineTo(i, yAt(i));
  x.lineTo(w,h); x.closePath(); x.fill();
  if(deco) deco(x, yAt);
  return cv;
}
function shade(hex, f){ // darken/lighten a #rrggbb by factor f
  const n=parseInt(hex.slice(1),16), r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  const c=v=>Math.max(0,Math.min(255,Math.round(v*f)));
  return 'rgb('+c(r)+','+c(g)+','+c(b)+')';
}
function pine(x, cx, cy, sc, col){
  x.fillStyle=col;
  x.fillRect(cx-2*sc, cy-4*sc, 4*sc, 4*sc);
  for(let t=0;t<3;t++){
    const wdt=(14-t*4)*sc, hgt=8*sc, py=cy-4*sc-(t+1)*hgt+2*t*sc;
    x.beginPath(); x.moveTo(cx-wdt/2,py+hgt); x.lineTo(cx,py); x.lineTo(cx+wdt/2,py+hgt); x.closePath(); x.fill();
  }
}
function bush(x, cx, cy, sc, col){
  x.fillStyle=col;
  x.beginPath(); x.arc(cx-6*sc,cy,6*sc,0,7); x.arc(cx,cy-4*sc,7*sc,0,7); x.arc(cx+6*sc,cy,6*sc,0,7); x.fill();
  x.fillRect(cx-12*sc,cy,24*sc,4*sc);
}
function parallaxKeys(levelId){
  const id = levelId || 'l1';
  return [`parallax_${id}_far`, `parallax_${id}_mid`, `parallax_${id}_near`];
}
function hasAuthoredParallax(levelId){
  if(!USE_AUTHORED_WORLD_LAYERS) return false;
  return parallaxKeys(levelId).every(k =>
    (Sprites.authored[k] || Sprites.custom[k]) && Sprites.frames[k] && Sprites.frames[k][0]);
}
/** Soft storybook sky/parallax — smooth blit (tiles/actors stay nearest-neighbour). */
function drawSoftPlate(img, dx, dy, dw, dh){
  ctx.save();
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}
function layerFromFrame(frame){
  const cv=document.createElement('canvas');
  cv.width=W*RES; cv.height=H*RES;
  const x=cv.getContext('2d');
  x.imageSmoothingEnabled=true;
  x.imageSmoothingQuality='high';
  x.drawImage(frame, 0, 0, W*RES, H*RES);
  return cv;
}
function buildBgLayers(pal, levelId){
  const speeds=[0.18, 0.42, 0.68];
  if(hasAuthoredParallax(levelId)){
    return parallaxKeys(levelId).map((k,i)=>({
      cv: layerFromFrame(Sprites.frames[k][0]),
      sp: speeds[i],
    }));
  }
  const far  = hillLayer(pal[0], 430, [{a:170,k:2,p:0.0},{a:70,k:5,p:1.7}]);
  const mid  = hillLayer(pal[1], 470, [{a:120,k:3,p:2.4},{a:46,k:7,p:0.6}], (x,yAt)=>{
    const c=shade(pal[1],0.72);
    [140,290,470,650,820].forEach((px,i)=>pine(x,px,yAt(px)+14,1+(i%2)*0.35,c));
  });
  const near = hillLayer(pal[2], 505, [{a:64,k:4,p:4.2},{a:26,k:9,p:1.2}], (x,yAt)=>{
    const c=shade(pal[2],0.78);
    [90,240,410,560,730,880].forEach((px,i)=>bush(x,px,yAt(px)+8,0.9+(i%3)*0.25,c));
  });
  return [{cv:far,sp:speeds[0]},{cv:mid,sp:speeds[1]},{cv:near,sp:speeds[2]}];
}
function drawParallax(){
  if(!G.bgLayers) return;
  for(const L of G.bgLayers){
    const w=L.cv.width/RES, h=L.cv.height/RES;   // layer canvases are RES×
    let off = -((G.cam*L.sp) % w); if(off>0) off-=w;
    // 1px overlap kills hairline seams between tiled plates
    for(let x=off; x<W; x+=w - 1/RES) drawSoftPlate(L.cv, x, 0, w, h);
  }
}



/*═══════════════════════════════════════════════════════════════════
  5) ENROLMENT STATE — everything the player selects lives here.
═══════════════════════════════════════════════════════════════════*/
const Enrol = {
  character: { name:'', gender:'', age:null, marital:'', skin:2 },
  dependants: [],           // {id, relation:'spouse'|'child'|'parent', name, gender, age}
  covered: [],              // member ids selected for GMC ('self' + dependant ids)
  gmc: null,                // {planId, planName, si, prem}
  addons: [],               // {id, name, per, memberIds:[], cost}
  gtl: null,                // {planId, name, si, prem}
  superTopUp: null,         // {planId, name, si, prem}
  nominees: [],             // {id?, name, relation, share}
  startedAt: Date.now(),
};
let depSeq = 1;
function allMembers(){
  return [{id:'self', relation:'self', name:Enrol.character.name||'You',
           gender:Enrol.character.gender, age:Enrol.character.age||25}, ...Enrol.dependants];
}
function coveredMembers(){ return allMembers().filter(m=>Enrol.covered.includes(m.id)); }
function totalPremium(){
  let t=0;
  if(Enrol.gmc) t+=Enrol.gmc.prem;
  for(const a of Enrol.addons) t+=a.cost;
  if(Enrol.gtl) t+=Enrol.gtl.prem;
  if(Enrol.superTopUp) t+=Enrol.superTopUp.prem;
  return t;
}

/*═══════════════════════════════════════════════════════════════════
  6) GAME ENGINE
═══════════════════════════════════════════════════════════════════*/
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
const RES=SCALE;              // device-pixel multiplier (art authored at 2x)
const TILE=32, W=960, H=540, GROUND_Y=448;   // logical world space

/* The canvas backing store is RES× the logical size (1920×1080) and the whole
   context is scaled by RES, so gameplay code stays in 960×540 units while every
   sprite, glyph and stroke lands on real 2× pixels. */
cv.width = W*RES; cv.height = H*RES;
function applyBaseTransform(){
  ctx.setTransform(RES,0,0,RES,0,0);
  ctx.imageSmoothingEnabled=false;
}
applyBaseTransform();

const G = {
  state:'loading',
  shake:0, hitStop:0, wipe:0, wipeDir:1, introT:0, // juice    // loading|title|play|summary
  levelIdx:0, t:0, paused:false,
  enemyIntro:null, // { enemy, type, t, zoom, faceDir, camY0 }
  introGapUntil:0, introFocus:null,
  deathSpot:null, // exact knock-out coords for mid-level respawn
  cam:0, camY:0, solids:[], movers:[], stations:[], portals:[], landmarks:[], enemies:[], coins:[], clouds:[], birds:[],
  flag:null, levelW:0, spawn:{x:64,y:GROUND_Y-32},
  p:{x:64,y:GROUND_Y-32,w:22,h:30,vx:0,vy:0,onGround:false,face:1,invuln:0,hearts:3},
  done:{},            // taskId -> true, per level
  coinsGot:0, stomps:0, deaths:0,
  score:0, levelStart:0, timeSpent:0,
  /** Snapshot of campaign counters at level start — for per-level scoreboard. */
  levelSnap:null,
  /** Active end-of-level results presentation (null when not showing). */
  levelResults:null,
};

const Input = {l:false,r:false,jump:false};
addEventListener('keydown', e=>{
  const typing = ['INPUT','SELECT','TEXTAREA'].includes((e.target&&e.target.tagName)||'');
  if(!typing && e.key==='Escape'){
    if(isPauseMenuOpen()){
      e.preventDefault();
      resumeGame();
      return;
    }
    if(canOpenPauseMenu()){
      e.preventDefault();
      openPauseMenu();
      return;
    }
  }
  if(G.enemyIntro && !typing && [' ','Enter','e','E'].includes(e.key)){
    e.preventDefault();
    dismissEnemyIntro();
    return;
  }
  if(!typing && G.state==='play' && !G.paused &&
     ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
  if(G.paused || G.state!=='play' || typing) return;
  if(e.key==='ArrowLeft'||e.key==='a') Input.l=true;
  if(e.key==='ArrowRight'||e.key==='d') Input.r=true;
  if(e.key===' '||e.key==='ArrowUp'||e.key==='w') Input.jump=true;
  if(e.key==='e'||e.key==='E'||e.key==='Enter') tryInteract();
  if(e.key==='x'||e.key==='X'||e.key==='f'||e.key==='F') Input.throw=true;
});
addEventListener('keyup', e=>{
  if(e.key==='ArrowLeft'||e.key==='a') Input.l=false;
  if(e.key==='ArrowRight'||e.key==='d') Input.r=false;
  // jump is consumed by the game loop (buffered), not cleared on keyup —
  // this way a quick tap between frames is never lost
});
// touch controls
function bindTouch(id, on, off){
  const el=document.getElementById(id);
  el.addEventListener('pointerdown', e=>{e.preventDefault(); on();});
  el.addEventListener('pointerup', e=>{e.preventDefault(); off&&off();});
  el.addEventListener('pointerleave', ()=>off&&off());
}
bindTouch('tL', ()=>Input.l=true, ()=>Input.l=false);
bindTouch('tR', ()=>Input.r=true, ()=>Input.r=false);
bindTouch('tJ', ()=>Input.jump=true, ()=>Input.jump=false);
bindTouch('tE', ()=>{
  if(G.enemyIntro){ dismissEnemyIntro(); return; }
  if(G.state==='play'&&!G.paused) tryInteract();
});
bindTouch('tT', ()=>{ Input.throw=true; });
if(matchMedia('(pointer:coarse)').matches) document.getElementById('touch').style.display='block';

const overlap=(a,b)=> a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
function pointSolid(x,y){
  for(const s of G.solids) if(x>=s.x&&x<s.x+s.w&&y>=s.y&&y<s.y+s.h) return true;
  for(const m of G.movers) if(x>=m.x&&x<m.x+m.w&&y>=m.y&&y<m.y+m.h) return true;
  return false;
}
function allSolids(){
  if(!G._solidsCache) G._solidsCache=G.solids.concat(G.movers);
  return G._solidsCache;
}

function moveX(e,dx){
  e.x+=dx;
  for(const s of allSolids()){
    if(overlap(e,s)){
      if(dx>0) e.x=s.x-e.w; else if(dx<0) e.x=s.x+s.w;
      e.vx=0;
    }
  }
  if(e.x<0){e.x=0;e.vx=0;}
  if(e.x>G.levelW-e.w){e.x=G.levelW-e.w;e.vx=0;}
}
function moveY(e,dy){
  e.y+=dy; e.onGround=false;
  for(const s of allSolids()){
    if(overlap(e,s)){
      if(dy>0){ e.y=s.y-e.h; e.onGround=true; e.vy=0; e._ride=s; }
      else if(dy<0){
        if(e===G.p && s.brick && s.brick.type==='soft'){ breakBrick(s); continue; }
        e.y=s.y+s.h; e.vy=0;
      }
    }
  }
}
function breakBrick(s){
  const i=G.solids.indexOf(s); if(i>=0) G.solids.splice(i,1);
  G._solidsCache=null;
  const j=G.bricks.indexOf(s); if(j>=0) G.bricks.splice(j,1);
  if(s.brick.coin){ G.coinsGot++; playSfx('coin'); addFloat(s.x+16, s.y-8, '+◉'); updateHUD(); }
  if(s.brick.pow){
    const kind = typeof s.brick.pow==='string' ? s.brick.pow : 'seal';
    G.pickups.push({x:s.x+6, y:s.y-24, w:20, h:20, vy:-3, kind});
    addFloat(s.x+16, s.y-10, '!');
  }
  for(let k=0;k<8;k++) (G.parts=G.parts||[]).push({
    x:s.x+16, y:s.y+16, vx:Math.random()*4-2, vy:-Math.random()*4-2, a:1});
  G.p.vy=0.5;
}

/* ---------- Levels ----------
   Defined declaratively; buildLevel() turns them into rects/entities.
   Units below are in TILES (1 tile = 32px).
   LEVELS_FULL = 4-level campaign. LEVELS_COMPACT = longer L1–L3 when L4 is off.
   Runtime LEVELS is swapped by applyLevelRoster() from Admin. */
const LEVELS_FULL = [
  /* Level anatomy: platforming + enemies in the FIRST ~70%, then a clean
     "enrolment plaza" near the flag where all boards stand side by side so
     choices can be compared at a glance.
     Enemies: e:{x, t:'sneezy'|'bill'|'junk'|'bone'|'denier'|'spike'} — see ETYPES.
     bricks: 'soft' break from below (coin inside; a random few hide combat
     power-ups: Seal Shot / Coverage Beam / Coverage Shield), 'hard' are
     indestructible steps/bridges.

     Geometry rules — `node scripts/check_level_layout.mjs` enforces these:
     - The player rises 114px (3.5 tiles) and clears 136px (4.2 tiles) of gap.
     - Row 12 is a no-go for anything an enemy can stand under: it leaves 32px
       of headroom, so nothing beneath it can ever be stomped. Use row 11.
     - Never spawn an enemy where the ceiling above it is lower than
       (448 − 30 − enemyHeight). Walking under such a ceiling mid-patrol is
       fine; starting there is not.
     - Keep bricks out of the rows directly above and below a platform, and
       out of a mover's whole travel path. */
  { id:'l1', name:'LEVEL 1 · FAMILY FIRST', bg:'bg_l1', width:78,
    pal:['#8fd4a8','#57b06e','#2f8a4c'],
    gaps:[{x:22,w:2},{x:44,w:2}],
    platforms:[{x:20,y:11,w:5},{x:27,y:10,w:4},{x:34,y:11,w:5},
               {x:42,y:11,w:5},{x:49,y:10,w:4}],
    bricks:[{x:14,y:11,w:1,type:'hard'},
            {x:39,y:10,w:3,type:'soft',coin:true},
            {x:53,y:10,w:3,type:'soft',coin:true}],
    stations:[],
    landmarks:[{x:3, key:'landmark_l1_start'}],
    portals:[{x:69, kind:'family', label:'FAMILY COTTAGE', landmark:'landmark_l1_end'}],
    // Family beat — Bone first, Bill later (spaced so intros don't stack).
    enemies:[{x:28,t:'bone'},{x:40,t:'bone'},{x:47,t:'bill'},{x:54,t:'bone'},{x:59,t:'bill'}],
    coins:[[8,12],[9,12],[10,12],[21,10],[22,10],[23,10],[28,9],[29,9],
           [35,10],[43,10],[44,10],[45,10],[50,9],[51,9],
           [60,12],[64,12],[67,12]],
    movers:[], required:['family'],
  },
  { id:'l2', name:'LEVEL 2 · MEDICAL COVER', bg:'bg_l2', width:84,
    pal:['#9fd4b8','#5fb88a','#2f8a68'],
    gaps:[{x:24,w:2},{x:48,w:3}],
    platforms:[{x:22,y:11,w:5},{x:29,y:11,w:4},{x:35,y:10,w:4},
               {x:46,y:11,w:6},{x:55,y:11,w:5},{x:61,y:10,w:4}],
    bricks:[{x:40,y:10,w:3,type:'soft',coin:true},
            {x:52,y:11,w:1,type:'hard'},
            {x:65,y:10,w:3,type:'soft',coin:true}],
    stations:[],
    portals:[{x:74, kind:'gmc', label:'MEDICAL CLINIC', landmark:'landmark_l2_end'}],
    landmarks:[{x:3, key:'landmark_l2_start'}, {x:77, key:'landmark_l2_end'}],
    // New: Denier early, Spike late — reuse Bill/Bone from L1 in between.
    enemies:[{x:21,t:'denier'},{x:34,t:'bill'},{x:43,t:'bone'},{x:56,t:'spike'},{x:64,t:'denier'}],
    coins:[[10,12],[11,12],[23,10],[24,10],[25,10],[30,10],[36,9],[37,9],
           [47,10],[48,10],[49,10],[56,10],[57,10],[62,9],[63,9],
           [68,12],[71,12]],
    movers:[], required:['gmc'],
  },
  { id:'l3', name:'LEVEL 3 · POWER-UPS (ADD-ONS)', bg:'bg_l3', width:86,
    pal:['#e8a06a','#c4744f','#8a4a3a'],
    gaps:[{x:20,w:2},{x:44,w:3}],
    platforms:[{x:19,y:11,w:4},{x:27,y:11,w:4},{x:33,y:10,w:4},
               {x:42,y:11,w:6},{x:52,y:11,w:5},{x:59,y:10,w:4},
               {x:67,y:11,w:5}],
    bricks:[{x:23,y:10,w:3,type:'soft',coin:true},
            {x:38,y:11,w:1,type:'hard'},
            {x:48,y:10,w:3,type:'soft',coin:true},
            {x:63,y:10,w:3,type:'soft',coin:true}],
    stations:[],
    portals:[{x:76, kind:'addon', label:'WELLBEING BAZAAR', landmark:'landmark_l3_end'}],
    landmarks:[{x:3, key:'landmark_l3_start'}, {x:79, key:'landmark_l3_end'}],
    // New: Sneezy early, Junk late — recycle Denier/Spike/Bill in the middle.
    enemies:[{x:25,t:'sneezy'},{x:39,t:'bill'},{x:50,t:'spike'},{x:61,t:'junk'},{x:69,t:'sneezy'}],
    coins:[[8,12],[9,12],[20,10],[21,10],[22,10],[28,10],[34,9],[35,9],
           [43,10],[44,10],[45,10],[49,9],[50,9],[53,10],[60,9],[61,9],
           [68,10],[69,10],[73,12]],
    movers:[], required:['addon'],
  },
  { id:'l4', name:'LEVEL 4 · TERM LIFE SHIELD', bg:'bg_l4', width:102,
    pal:['#5a5f9e','#3c4178','#262a54'],
    gaps:[{x:16,w:3},{x:38,w:3},{x:62,w:4}],
    platforms:[{x:15,y:11,w:5},{x:25,y:11,w:4},{x:31,y:10,w:4},
               {x:37,y:11,w:5},{x:48,y:11,w:5},{x:54,y:10,w:4},
               {x:61,y:11,w:6},{x:72,y:11,w:5}],
    bricks:[{x:21,y:10,w:3,type:'soft',coin:true},
            {x:35,y:11,w:1,type:'hard'},
            {x:43,y:10,w:3,type:'soft',coin:true},
            {x:58,y:10,w:3,type:'soft',coin:true}],
    stations:[{x:80,task:'gtl'},{x:88,task:'nominees'}],
    // Finale mix — all types already known; Spike/Denier featured for GTL.
    enemies:[{x:22,t:'spike'},{x:36,t:'denier'},{x:48,t:'junk'},{x:60,t:'bill'},{x:70,t:'spike'},{x:78,t:'bone'}],
    coins:[[9,12],[10,12],[16,10],[17,10],[18,10],[26,10],[32,9],[33,9],
           [39,10],[40,10],[41,10],[49,10],[50,10],[55,9],[56,9],
           [62,10],[63,10],[64,10],[69,12],[73,10],[78,12],[84,12],[91,12]],
    movers:[],
    flag:96, required:['gtl','nominees'],
  },
];

/** Slightly longer L1–L3 used when Admin turns Level 4 off. Plaza stays calm. */
const LEVELS_COMPACT = [
  { id:'l1', name:'LEVEL 1 · FAMILY FIRST', bg:'bg_l1', width:92,
    pal:['#8fd4a8','#57b06e','#2f8a4c'],
    gaps:[{x:22,w:2},{x:44,w:2},{x:66,w:2}],
    platforms:[{x:20,y:11,w:5},{x:27,y:10,w:4},{x:34,y:11,w:5},
               {x:42,y:11,w:5},{x:49,y:10,w:4},{x:64,y:11,w:5},
               {x:72,y:10,w:4}],
    bricks:[{x:14,y:11,w:1,type:'hard'},
            {x:39,y:10,w:3,type:'soft',coin:true},
            {x:53,y:10,w:3,type:'soft',coin:true},
            {x:58,y:10,w:3,type:'soft',coin:true}],
    stations:[],
    landmarks:[{x:3, key:'landmark_l1_start'}],
    portals:[{x:82, kind:'family', label:'FAMILY COTTAGE', landmark:'landmark_l1_end'}],
    enemies:[{x:28,t:'bone'},{x:40,t:'bone'},{x:47,t:'bill'},{x:54,t:'bone'},{x:62,t:'bill'},{x:74,t:'bone'}],
    coins:[[8,12],[9,12],[10,12],[21,10],[22,10],[23,10],[28,9],[29,9],
           [35,10],[43,10],[44,10],[45,10],[50,9],[51,9],[59,9],[60,9],
           [65,10],[66,10],[67,10],[73,9],[74,9],[78,12]],
    movers:[], required:['family'],
  },
  { id:'l2', name:'LEVEL 2 · MEDICAL COVER', bg:'bg_l2', width:98,
    pal:['#9fd4b8','#5fb88a','#2f8a68'],
    gaps:[{x:24,w:2},{x:48,w:3},{x:72,w:2}],
    platforms:[{x:22,y:11,w:5},{x:29,y:11,w:4},{x:35,y:10,w:4},
               {x:46,y:11,w:6},{x:55,y:11,w:5},{x:61,y:10,w:4},
               {x:70,y:11,w:5},{x:78,y:10,w:4}],
    bricks:[{x:40,y:10,w:3,type:'soft',coin:true},
            {x:52,y:11,w:1,type:'hard'},
            {x:65,y:10,w:3,type:'soft',coin:true},
            {x:82,y:10,w:3,type:'soft',coin:true}],
    stations:[],
    portals:[{x:88, kind:'gmc', label:'MEDICAL CLINIC', landmark:'landmark_l2_end'}],
    landmarks:[{x:3, key:'landmark_l2_start'}, {x:91, key:'landmark_l2_end'}],
    enemies:[{x:21,t:'denier'},{x:34,t:'bill'},{x:43,t:'bone'},{x:58,t:'spike'},{x:68,t:'denier'},{x:80,t:'bill'}],
    coins:[[10,12],[11,12],[23,10],[24,10],[25,10],[30,10],[36,9],[37,9],
           [47,10],[48,10],[49,10],[56,10],[57,10],[62,9],[63,9],
           [69,10],[70,10],[71,10],[79,9],[80,9],[85,12]],
    movers:[], required:['gmc'],
  },
  { id:'l3', name:'LEVEL 3 · POWER-UPS (ADD-ONS)', bg:'bg_l3', width:104,
    pal:['#e8a06a','#c4744f','#8a4a3a'],
    gaps:[{x:20,w:2},{x:44,w:3},{x:68,w:2}],
    platforms:[{x:19,y:11,w:4},{x:27,y:11,w:4},{x:33,y:10,w:4},
               {x:42,y:11,w:6},{x:52,y:11,w:5},{x:59,y:10,w:4},
               {x:66,y:11,w:5},{x:75,y:11,w:5},{x:82,y:10,w:4}],
    bricks:[{x:23,y:10,w:3,type:'soft',coin:true},
            {x:38,y:11,w:1,type:'hard'},
            {x:48,y:10,w:3,type:'soft',coin:true},
            {x:63,y:10,w:3,type:'soft',coin:true},
            {x:86,y:10,w:3,type:'soft',coin:true}],
    stations:[],
    portals:[{x:94, kind:'addon', label:'WELLBEING BAZAAR', landmark:'landmark_l3_end'}],
    landmarks:[{x:3, key:'landmark_l3_start'}, {x:97, key:'landmark_l3_end'}],
    enemies:[{x:25,t:'sneezy'},{x:39,t:'bill'},{x:50,t:'spike'},{x:61,t:'junk'},{x:72,t:'sneezy'},{x:84,t:'junk'}],
    coins:[[8,12],[9,12],[20,10],[21,10],[22,10],[28,10],[34,9],[35,9],
           [43,10],[44,10],[45,10],[49,9],[50,9],[53,10],[60,9],[61,9],
           [67,10],[68,10],[69,10],[76,10],[77,10],[83,9],[84,9],[90,12]],
    movers:[],
    required:['addon'],
  },
];

/** Optional extras — keep empty so each level stays at ≤2 unique intro types. */
const EXTRA_ENEMIES_FULL = [[], [], [], []];
const EXTRA_ENEMIES_COMPACT = [[], [], []];
/** Runtime roster — mutated by applyLevelRoster(). */
const LEVELS = [];
let EXTRA_ENEMIES = EXTRA_ENEMIES_FULL;

function applyLevelRoster(){
  const src = CONFIG.enableLevel4 ? LEVELS_FULL : LEVELS_COMPACT;
  LEVELS.length = 0;
  for(const L of src) LEVELS.push(L);
  EXTRA_ENEMIES = CONFIG.enableLevel4 ? EXTRA_ENEMIES_FULL : EXTRA_ENEMIES_COMPACT;
}

async function loadCompanyPref(){
  try{
    const r = await Store.get('cfg:companyId');
    if(r && r.value){
      setActiveCompany(String(r.value));
    }else{
      setActiveCompany(getActiveCompanyId());
    }
  }catch(_){
    setActiveCompany(getActiveCompanyId());
  }
  applyActiveCompanyProfile({ preserveMode:true, preserveLevel4:true });
}
function saveCompanyPref(){
  Store.set('cfg:companyId', CONFIG.activeCompanyId);
}

async function loadLevel4Pref(){
  try{
    const r = await Store.get('cfg:enableLevel4');
    if(r && r.value!=null) CONFIG.enableLevel4 = r.value === '1' || r.value === 'true';
  }catch(e){}
  applyLevelRoster();
}
function saveLevel4Pref(){
  Store.set('cfg:enableLevel4', CONFIG.enableLevel4 ? '1' : '0');
}
applyLevelRoster(); // sync from CONFIG default before async pref load

function spawnEnemyAt(tileX, type){
  const T=ETYPES[type]||ETYPES.sneezy;
  return {t:type, x:tileX*TILE, y:GROUND_Y-T.h, w:T.w, h:T.h,
    vx:-T.speed, vy:0, hp:T.hp, dead:false, onGround:true, ai:((tileX*37)%120)|0,
    state: type==='spike' ? 'idle' : 'walk', cool:0};
}

function buildLevel(i){
  const L=LEVELS[i];
  G.levelIdx=i; G.solids=[]; G.movers=[]; G.stations=[]; G.portals=[]; G.landmarks=[]; G.enemies=[];
  G.coins=[];
  // Keep enrolment milestones across levels so HUD focus chips stay available.
  const carried={
    family:!!G.done.family, coverConfirm:!!G.done.coverConfirm,
    gmc:!!G.done.gmc, addon:!!G.done.addon, addonConfirm:!!G.done.addonConfirm,
    gtl:!!G.done.gtl, nominees:!!G.done.nominees,
  };
  G.done={...carried};
  G.cam=0; G.camY=camYForGround(); G.levelW=L.width*TILE;
  G.flag = (L.flag!=null) ? {x:L.flag*TILE, y:GROUND_Y-64} : null;
  // ground with gaps
  let cx=0;
  const gaps=[...L.gaps].sort((a,b)=>a.x-b.x);
  for(const g of gaps){
    if(g.x>cx) G.solids.push({x:cx*TILE,y:GROUND_Y,w:(g.x-cx)*TILE,h:H-GROUND_Y,ground:true});
    cx=g.x+g.w;
  }
  if(cx<L.width) G.solids.push({x:cx*TILE,y:GROUND_Y,w:(L.width-cx)*TILE,h:H-GROUND_Y,ground:true});
  for(const p of L.platforms) G.solids.push({x:p.x*TILE,y:p.y*TILE,w:p.w*TILE,h:TILE,plat:true});
  for(const m of L.movers) G.movers.push({x:m.x*TILE,y:m.y*TILE,w:m.w*TILE,h:TILE,
    x0:m.x*TILE, range:m.range*TILE, speed:m.speed, dir:1});
  for(const s of L.stations){
    const t=s.task; let w=86, h=112;                 // info-board size by type
    if(t.startsWith('addon_')){ w=96; h=128; }
    else if(t==='gtl'){ w=96; h=104; }
    else if(t==='nominees'){ w=88; h=100; }
    const surfY = (s.surf!==undefined ? s.surf*TILE : GROUND_Y);
    G.stations.push({x:s.x*TILE+16-w/2, y:surfY-h, w, h, task:t});
  }
  for(const pr of (L.portals||[])){
    const lmKey=pr.landmark||null;
    const d=lmKey && SPRITE_DEFS[lmKey];
    // Hitbox matches landmark art when present (scaled gates / walk-ins)
    const w=d ? (d.w/RES)*LANDMARK_SCALE : 96;
    const h=d ? (d.h/RES)*LANDMARK_SCALE : 112;
    G.portals.push({
      x:pr.x*TILE+16-w/2, y:GROUND_Y-h+LANDMARK_SINK, w, h,
      kind:pr.kind||'family', label:pr.label||'ENTER', entered:false,
      landmark: lmKey,
    });
  }
  for(const lm of (L.landmarks||[])){
    const key=lm.key;
    const d=SPRITE_DEFS[key]||{w:128,h:128};
    const w=(d.w/RES)*LANDMARK_SCALE, h=(d.h/RES)*LANDMARK_SCALE;
    G.landmarks.push({
      key, x:lm.x*TILE+16-w/2, y:GROUND_Y-h+LANDMARK_SINK, w, h,
    });
  }
  for(const e of L.enemies){
    G.enemies.push(spawnEnemyAt(e.x, e.t));
  }
  for(const e of (EXTRA_ENEMIES[i]||[])){
    G.enemies.push(spawnEnemyAt(e.x, e.t));
  }
  for(const c of L.coins) G.coins.push({x:c[0]*TILE+8, y:c[1]*TILE+8, w:16, h:16, got:false});
  // bricks (each tile is its own solid so soft ones break one at a time)
  G.bricks=[];
  for(const b of (L.bricks||[])) for(let k=0;k<b.w;k++){
    const solid={x:(b.x+k)*TILE, y:b.y*TILE, w:TILE, h:TILE, brick:{type:b.type, coin:!!b.coin}};
    G.solids.push(solid); G.bricks.push(solid);
  }
  // hide combat power-ups in random soft bricks (Seal Shot common; Beam/Shield rarer)
  {
    const softs=G.bricks.filter(b=>b.brick.type==='soft');
    for(let k=softs.length-1;k>0;k--){ const j=(Math.random()*(k+1))|0; const t2=softs[k]; softs[k]=softs[j]; softs[j]=t2; }
    // Compact (no L4): slightly more power drops so the shorter campaign still feels generous
    const bonus = CONFIG.enableLevel4 ? 0 : (Math.random()<0.55?1:0);
    const n = Math.min(softs.length, 1+(Math.random()<0.55?1:0)+bonus);
    softs.slice(0, n).forEach((b, idx)=>{
      b.brick.coin=false;
      if(idx===0) b.brick.pow = Math.random()<0.22 ? 'beam' : 'seal';
      else if(idx===1) b.brick.pow = Math.random()<0.5 ? 'beam' : 'shield';
      else b.brick.pow = Math.random()<0.4 ? 'seal' : (Math.random()<0.5?'beam':'shield');
    });
  }
  G.shots=[]; G.pickups=[]; G.fx=[];
  G.npcs=[]; // L1 family enrolment is the Focus Zone (cottage portal)
  G.bgLayers = buildBgLayers(L.pal || ['#57b06e','#3f8a56','#2f6a44'], L.id);
  G.parts=[]; G._solidsCache=null; BoardCache.clear();
  G.clouds=[]; for(let k=0;k<Math.ceil(L.width/12);k++) G.clouds.push({x:k*380+((k*173)%200), y:40+((k*97)%120), s:0.15+((k*13)%10)/40});
  G.birds=[]; for(let k=0;k<3+i;k++) G.birds.push({x:(k*450)%G.levelW, y:60+((k*77)%90), v:0.5+((k*7)%10)/12, ph:k*2});
  G.spawn={x:2*TILE, y:GROUND_Y-40};
  G.lastSafe={x:G.spawn.x, y:G.spawn.y};
  G.p.x=G.spawn.x; G.p.y=G.spawn.y; G.p.vx=0; G.p.vy=0; G.p.hearts=3; G.p.invuln=0;
  G.p.slowT=0; G.p.powT=0; G.p.powKind=null; G.p.shootCd=0; G.p.shieldT=0;
  G.levelStart=performance.now();
  G.introGapUntil=0;
  G.introFocus=null;
  G.deathSpot=null;
  G.levelSnap={ coinsGot:G.coinsGot, stomps:G.stomps, deaths:G.deaths };
  document.getElementById('lvlName').textContent=L.name;
  updateHUD();
  setThrowBtn(false); updatePowHud();
}

const ETYPES={
  sneezy:{w:26,h:24, speed:0.45, hp:1},
  bill:  {w:24,h:44, speed:0.35, hp:1},
  junk:  {w:28,h:28, speed:0.5,  hp:1},
  bone:  {w:24,h:36, speed:0.4,  hp:2},
  denier:{w:28,h:38, speed:0.32, hp:1},
  spike: {w:26,h:28, speed:0.4,  hp:1},
};
function respawn(){
  // Prefer the exact knock-out spot; fall back to last solid footing, then level start.
  let sp = G.deathSpot || G.lastSafe || G.spawn;
  G.deathSpot = null;
  // Never drop the hero back into a pit.
  if(!sp || sp.y > GROUND_Y + 24) sp = G.lastSafe || G.spawn;
  G.p.x = sp.x;
  G.p.y = Math.min(sp.y, GROUND_Y - G.p.h);
  G.p.vx = 0; G.p.vy = 0; G.p.invuln = 110;
  // Keep the camera on the respawn — don't snap back to the level start.
  G.cam = Math.max(0, Math.min(G.p.x - viewW()/2 + 40, Math.max(0, G.levelW - viewW())));
  G.camY = camYForGround();
}
function juice(shake=10, stop=0){ G.shake=Math.max(G.shake, shake); G.hitStop=Math.max(G.hitStop, stop); }

/* ---------- First-look enemy intros (once per type) ---------- */
const ENEMY_INTRO_ZOOM = 1.12; // gentle — keep hero + foe framed together
const ENEMY_INTRO_ZOOM_IN = 52;
const ENEMY_INTRO_ZOOM_OUT = 28;
/** Give players time to read before any input can dismiss the intro. */
const ENEMY_INTRO_MIN_READ_MS = 2500;
/** Calm opening: jump / coins with no foe AI before the first threat. */
const ENEMY_GRACE_MS = 2600;
/** Foe must be at least this far into the view (from the right) before intro. */
const ENEMY_INTRO_INSET = 0.24;
/** Minimum quiet time after one intro before another can start. */
const ENEMY_INTRO_GAP_MS = 7000;

function enemiesInGrace(){
  return performance.now() - G.levelStart < ENEMY_GRACE_MS;
}

function playZoom(){
  return VIEW_ZOOM * (G.enemyIntro ? G.enemyIntro.zoom : 1);
}

function enemyIntroFrame(e){
  if(G.enemyIntro && G.enemyIntro.enemy !== e){
    return G.enemyIntro.freezeAf|0;
  }
  return Math.floor(G.t/7)%5;
}

function paintEnemyIntroSprite(){
  const cv = document.getElementById('eiSprite');
  const intro = G.enemyIntro;
  if(!cv || !intro) return;
  const key = 'enemy_' + intro.type;
  const frames = Sprites.frames[key];
  if(!frames || !frames.length) return;
  const fr = frames[Math.floor(G.t / 7) % frames.length];
  if(!fr) return;
  const x = cv.getContext('2d');
  if(!x) return;
  x.imageSmoothingEnabled = false;
  x.clearRect(0, 0, cv.width, cv.height);
  const pad = 10;
  const sc = Math.min((cv.width - pad * 2) / fr.width, (cv.height - pad * 2) / fr.height);
  const dw = Math.round(fr.width * sc), dh = Math.round(fr.height * sc);
  const dx = Math.round((cv.width - dw) / 2);
  const dy = Math.round(cv.height - dh - pad);
  x.drawImage(fr, 0, 0, fr.width, fr.height, dx, dy, dw, dh);
}

/** Pin the info card next to the spotlight foe (overlay CSS px). */
function layoutEnemyIntroCard(){
  const intro = G.enemyIntro;
  const root = document.getElementById('enemyIntro');
  const card = root && root.querySelector('.ei-card');
  const scrim = root && root.querySelector('.ei-scrim');
  const e = intro && intro.enemy;
  if(!root || !card || !e || e.dead) return;
  const rw = root.clientWidth, rh = root.clientHeight;
  if(rw < 8 || rh < 8) return;

  const z = playZoom();
  const midX = (e.x + e.w / 2 - G.cam) * z;
  const topY = (e.y - (G.camY || 0)) * z;
  const footY = (e.y + e.h - (G.camY || 0)) * z;
  const cssX = (midX / W) * rw;
  const cssTop = (topY / H) * rh;
  const cssFoot = (footY / H) * rh;

  // Force a layout pass so offsetWidth is real after unhide.
  const cw = Math.max(card.offsetWidth, 200);
  const ch = Math.max(card.offsetHeight, 120);
  const pad = 10;

  let left = cssX - cw / 2;
  let top = cssTop - ch - 12; // prefer just above the foe
  if(top < pad){
    top = cssFoot + 8; // else just below the feet
  }
  if(top + ch > rh - pad){
    // Side dock — keep the card on the roomier half of the screen
    top = Math.max(pad, Math.min(cssTop - ch * 0.35, rh - ch - pad));
    left = cssX > rw * 0.55 ? cssX - cw - 14 : cssX + 14;
  }
  left = Math.max(pad, Math.min(left, rw - cw - pad));
  top = Math.max(pad, Math.min(top, rh - ch - pad));

  card.style.left = Math.round(left) + 'px';
  card.style.top = Math.round(top) + 'px';

  if(scrim){
    const px = Math.round((cssX / rw) * 100);
    const py = Math.round((((cssTop + cssFoot) / 2) / rh) * 100);
    scrim.style.background =
      `radial-gradient(ellipse at ${px}% ${py}%, rgba(16,12,28,.04), rgba(16,12,28,.34) 78%)`;
  }
}

/** Keep hero + foe on screen together; foe sits mid-right of the frame. */
function frameEnemyIntroCam(intro, ease){
  const e = intro.enemy;
  if(!e || e.dead) return;
  const z = VIEW_ZOOM * intro.zoom;
  const vw = W / z;
  const vh = H / z;
  const px = G.p.x + G.p.w / 2;
  const ex = e.x + e.w / 2;
  const margin = vw * 0.14;
  // Bias framing so the foe lands ~58% across — card docks beside them.
  let wantCam = ex - vw * 0.58;
  wantCam = Math.min(wantCam, px - margin);
  wantCam = Math.max(wantCam, px + margin - vw);
  wantCam = Math.min(wantCam, ex - margin);
  wantCam = Math.max(wantCam, ex + margin - vw);
  wantCam = Math.max(0, Math.min(wantCam, Math.max(0, G.levelW - vw)));
  G.cam = intro.cam0 + (wantCam - intro.cam0) * ease;
  const wantY = Math.max(0, Math.min(camYForGround(), e.y + e.h - vh * 0.72));
  G.camY = intro.camY0 + (wantY - intro.camY0) * ease * 0.55;
}

function beginEnemyIntro(e){
  const def = getEnemyIntro(e.t);
  if(!def || G.enemyIntro) return;
  markEnemyIntroSeen(e.t);
  const faceDir = Math.sign(e.vx) || -1;
  e.vx = 0; e.vy = 0;
  if(e.t==='spike' && e.state==='leap') e.state = 'idle';
  Input.l=Input.r=Input.jump=Input.throw=false;
  G.paused = true;
  const freezeAf = Math.floor(G.t/7)%5;
  G.enemyIntro = {
    enemy: e,
    type: e.t,
    t: 0,
    zoom: 1,
    faceDir,
    cam0: G.cam,
    camY0: G.camY,
    phase: 'in', // in | hold | out
    freezeAf,
    dismissAt: performance.now() + ENEMY_INTRO_MIN_READ_MS,
  };
  const root = document.getElementById('enemyIntro');
  if(root){
    document.getElementById('eiName').textContent = def.name;
    document.getElementById('eiFoe').textContent = def.foeLine;
    document.getElementById('eiTag').textContent = def.benefitTag;
    document.getElementById('eiBenefit').textContent = def.benefitWhy;
    const dismissBtn = document.getElementById('eiDismiss');
    if(dismissBtn) dismissBtn.disabled = true;
    root.hidden = false;
    paintEnemyIntroSprite();
    layoutEnemyIntroCard();
    requestAnimationFrame(()=>{
      layoutEnemyIntroCard();
      root.classList.add('show');
    });
  }
  playSfx('desk');
}

function dismissEnemyIntro(force=false){
  const intro = G.enemyIntro;
  if(!intro || intro.phase==='out') return;
  if(!force && performance.now() < intro.dismissAt) return;
  intro.phase = 'out';
  intro.outT = 0;
  intro.zoomStart = intro.zoom;
  intro.camStart = G.cam;
  intro.camYStart = G.camY;
  const root = document.getElementById('enemyIntro');
  if(root) root.classList.remove('show');
  playSfx('confirm');
}

function finishEnemyIntro(){
  const intro = G.enemyIntro;
  if(!intro) return;
  const e = intro.enemy;
  const T = ETYPES[intro.type] || ETYPES.sneezy;
  if(e && !e.dead){
    e.vx = intro.faceDir * T.speed;
    if(e.t==='spike') e.state = 'idle';
  }
  // Don't stack intros — wait a beat, and prefer clearing the spotlight foe first.
  G.introFocus = e && !e.dead ? e : null;
  G.introGapUntil = performance.now() + ENEMY_INTRO_GAP_MS;
  clearEnemyIntroUI(false);
}

function clearEnemyIntroUI(keepPaused){
  G.enemyIntro = null;
  if(!keepPaused) G.paused = false;
  G.camY = camYForGround();
  const root = document.getElementById('enemyIntro');
  if(root){
    root.classList.remove('show');
    root.hidden = true;
  }
  const dismissBtn = document.getElementById('eiDismiss');
  if(dismissBtn) dismissBtn.disabled = false;
  const cv = document.getElementById('eiSprite');
  if(cv){
    const x = cv.getContext('2d');
    if(x) x.clearRect(0, 0, cv.width, cv.height);
  }
}

function updateEnemyIntro(){
  const intro = G.enemyIntro;
  if(!intro) return;
  intro.t++;
  // Only the spotlight foe keeps cycling frames (shared clock).
  G.t++;
  const e = intro.enemy;
  if(e){
    e.vx = 0; e.vy = 0;
    if(e.t==='spike') e.state = 'idle';
  }
  // Never trap the player if the spotlight foe vanished.
  if(intro.phase!=='out' && (!e || e.dead)){ dismissEnemyIntro(true); return; }

  const dismissBtn = document.getElementById('eiDismiss');
  if(dismissBtn && dismissBtn.disabled && performance.now() >= intro.dismissAt){
    dismissBtn.disabled = false;
  }

  paintEnemyIntroSprite();
  layoutEnemyIntroCard();

  if(intro.phase==='in'){
    const u = Math.min(1, intro.t / ENEMY_INTRO_ZOOM_IN);
    const ease = 1 - Math.pow(1 - u, 3);
    intro.zoom = 1 + (ENEMY_INTRO_ZOOM - 1) * ease;
    frameEnemyIntroCam(intro, ease);
    layoutEnemyIntroCard();
    if(u>=1) intro.phase = 'hold';
    return;
  }

  if(intro.phase==='hold'){
    frameEnemyIntroCam(intro, 1);
    layoutEnemyIntroCard();
    return;
  }

  // zoom out → resume
  intro.outT = (intro.outT||0) + 1;
  const u = Math.min(1, intro.outT / ENEMY_INTRO_ZOOM_OUT);
  const ease = 1 - Math.pow(1 - u, 2);
  intro.zoom = intro.zoomStart + (1 - intro.zoomStart) * ease;
  const z = VIEW_ZOOM * intro.zoom;
  const vw = W / z;
  const wantCam = Math.max(0, Math.min(G.p.x - vw/2 + 40, Math.max(0, G.levelW - vw)));
  G.cam = intro.camStart + (wantCam - intro.camStart) * ease;
  G.camY = intro.camYStart + (camYForGround() - intro.camYStart) * ease;
  layoutEnemyIntroCard();
  if(u>=1) finishEnemyIntro();
}

/** Alive, on-stage, not already introduced this session. */
function enemyIntroReady(e){
  if(e.dead) return false;
  if(!getEnemyIntro(e.t)) return false;
  // Premium Spike's intro is about Term Life — skip it entirely for companies
  // that don't ship Level 4 / GTL at all (every company today).
  if(e.t==='spike' && !CONFIG.enableLevel4) return false;
  if(enemyIntroSeen.has(e.t)) return false;
  if(e.t==='bone' && e.state==='pile') return false;
  if(e.y > GROUND_Y + 40) return false; // fallen into a pit
  return true;
}

function checkEnemyFirstViews(){
  if(G.enemyIntro || G.paused || G.state!=='play') return;
  // Opening calm — jump / coins before any spotlight hijack.
  if(enemiesInGrace()) return;
  // Pace intros: never back-to-back while the last spotlight foe is still in play.
  if(performance.now() < (G.introGapUntil||0)) return;
  const focus = G.introFocus;
  if(focus && !focus.dead){
    const vw = viewW();
    // Still on this stretch of road — let the player deal with them first.
    if(focus.x + focus.w > G.cam - 80 && focus.x < G.cam + vw + 80) return;
    G.introFocus = null;
  } else if(focus && focus.dead){
    G.introFocus = null;
  }
  const vw = viewW();
  const viewL = G.cam, viewR = G.cam + vw;
  const inset = vw * ENEMY_INTRO_INSET;
  const pc = G.p.x + G.p.w / 2;
  let best = null, bestD = Infinity;
  for(const e of G.enemies){
    if(!enemyIntroReady(e)) continue;
    // Wait until the foe is well into the frame (not just peeking at the edge).
    if(e.x + e.w < viewL + 8 || e.x > viewR - inset) continue;
    const ec = e.x + e.w / 2;
    if(ec < pc - 100) continue; // already well behind the hero
    const d = Math.abs(ec - pc);
    if(d < bestD){ bestD = d; best = e; }
  }
  if(best) beginEnemyIntro(best);
}
function hurt(){
  if(G.p.invuln>0) return;
  if(G.p.shieldT>0){
    G.p.shieldT=0; G.p.invuln=50;
    playSfx('power'); juice(8, 3);
    spawnFx('fx_puff', G.p.x+4, G.p.y+4, 0, -1, 28);
    addFloat(G.p.x+8, G.p.y-8, 'SHIELD!');
    toast('Coverage Shield absorbed the hit!');
    updatePowHud();
    return;
  }
  playSfx('hurt'); juice(14, 4);
  G.p.hearts--; updateHUD();
  if(G.p.hearts<=0){
    G.deaths++; G.p.hearts=3;
    // Respawn on this exact stretch of the level (not the start).
    if(G.p.y <= H + 40){
      G.deathSpot = {x:G.p.x, y:G.p.y};
      G.lastSafe = {x:G.p.x, y:Math.min(G.p.y, GROUND_Y - G.p.h)};
    } else {
      G.deathSpot = null; // pit — use lastSafe
    }
    toast('Ouch! Respawning right where you fell — selections are safe.');
    respawn();
  }
  else{ G.p.invuln=80; G.p.vy=-6; G.p.vx = G.p.face*-4; }
}

function spawnFx(spr, x, y, vx, vy, life){
  G.fx.push({spr, x, y, vx:vx||0, vy:vy||0, life:life||30, life0:life||30});
}
function stompEnemy(e){
  e.hp--;
  playSfx('stomp'); juice(8, 5);
  if(e.t==='bone' && e.hp>0){
    e.state='pile'; e.pileT=e.ai;
    spawnFx('fx_bone', e.x-2, e.y, -1.4, -2.4, 40);
    spawnFx('fx_bone', e.x+e.w-4, e.y, 1.4, -2.2, 40);
    addFloat(e.x+8, e.y-6, '+50'); G.stomps++;
    return;
  }
  e.dead=true; e.deadT=G.t; G.stomps++;
  const cx=e.x+e.w/2, cy=e.y+4;
  if(e.t==='bill'){
    spawnFx('fx_bill', cx-10, cy, -1.6, -2.6, 44); spawnFx('fx_bill', cx, cy-6, 0.4, -3, 44);
    spawnFx('fx_bill', cx+8, cy, 1.8, -2.2, 44);
    addFloat(cx, e.y-6, '+100');
  } else if(e.t==='junk'){
    spawnFx('fx_splash', cx-8, cy, -1.2, -2, 40); spawnFx('fx_splash', cx+4, cy, 1.2, -2.4, 40);
    addFloat(cx, e.y-6, '+100');
  } else if(e.t==='bone'){
    spawnFx('fx_bone', cx-10, cy, -1.8, -2.8, 46); spawnFx('fx_bone', cx, cy-4, 0, -3.2, 46);
    spawnFx('fx_bone', cx+8, cy, 1.8, -2.4, 46);
    addFloat(cx, e.y-6, '+150');
  } else if(e.t==='denier'){
    spawnFx('fx_puff', cx-8, cy, -1, -1.8, 36); spawnFx('fx_bill', cx+2, cy, 1.2, -2.4, 40);
    addFloat(cx, e.y-6, '+120');
  } else if(e.t==='spike'){
    spawnFx('fx_puff', cx-6, cy, -0.9, -2, 34); spawnFx('fx_puff', cx+4, cy, 0.9, -2.2, 34);
    addFloat(cx, e.y-6, '+130');
  } else {
    spawnFx('fx_puff', cx-8, cy, -0.8, -1.6, 34); spawnFx('fx_puff', cx+2, cy, 0.8, -1.8, 34);
    addFloat(cx, e.y-6, '+100');
  }
}
function setThrowBtn(on){
  const el=document.getElementById('tT'); if(el) el.style.display=on?'flex':'none';
}
function updatePowHud(){
  const el=document.getElementById('powHud'); if(!el) return;
  const p=G.p;
  const bits=[];
  if(p.powT>0 && p.powKind==='seal') bits.push('Seal '+Math.ceil(p.powT/60)+'s');
  if(p.powT>0 && p.powKind==='beam') bits.push('Beam '+Math.ceil(p.powT/60)+'s');
  if(p.shieldT>0) bits.push('Shield '+Math.ceil(p.shieldT/60)+'s');
  if(bits.length){ el.style.display='inline-flex'; el.textContent=bits.join(' · '); }
  else el.style.display='none';
}
function applyPowerup(kind){
  const p=G.p;
  playSfx('power'); juice(6, 2);
  if(kind==='shield'){
    p.shieldT=8*60;
    toast('Coverage Shield! Absorb one hit — 8 seconds.');
  } else if(kind==='beam'){
    p.powKind='beam'; p.powT=10*60; p.shootCd=0;
    toast('Coverage Beam! Press X — long range, pierces multiple foes.');
    setThrowBtn(true);
  } else {
    p.powKind='seal'; p.powT=12*60; p.shootCd=0;
    toast('Seal Shot! Press X (or ⚡) to throw approval seals — 12 seconds!');
    setThrowBtn(true);
  }
  updatePowHud();
}
/** True when the player is on the side the enemy is facing (front shield). */
function hitDenierFront(p, e){
  const face = e.vx===0 ? -1 : Math.sign(e.vx);
  const side = Math.sign((p.x+p.w/2)-(e.x+e.w/2));
  return side===face;
}
function openFocus(f){
  if(!f) return;
  if(f.kind==='portal') openPortal(f.o);
  else if(f.kind==='npc') openDependant(f.o.slot);
  else openTask(f.o.task);
}
function tryInteract(){ openFocus(G.focus); }

// tap/click a board, portal, or family member to open it (must be reasonably close)
document.getElementById('game').addEventListener('pointerdown', e=>{
  if(G.enemyIntro){ dismissEnemyIntro(); return; }
  if(G.state!=='play' || G.paused) return;
  const cvEl=document.getElementById('game'), r=cvEl.getBoundingClientRect();
  const mx=(e.clientX-r.left)*(W/r.width)/VIEW_ZOOM + G.cam;
  const my=(e.clientY-r.top)*(H/r.height)/VIEW_ZOOM + (G.camY||0);
  const hit=o=> mx>=o.x-10 && mx<=o.x+o.w+10 && my>=o.y-14 && my<=o.y+o.h+14;
  let target=null;
  for(const pr of (G.portals||[])) if(hit(pr)) target={kind:'portal', o:pr};
  for(const n of (G.npcs||[])) if(hit(n)) target={kind:'npc', o:n};
  for(const st of G.stations)  if(hit(st)) target={kind:'station', o:st};
  if(!target) return;
  const d=Math.abs((target.o.x+target.o.w/2)-(G.p.x+G.p.w/2));
  if(d>260){ toast('Walk closer to reach it!'); return; }
  openFocus(target);
});

function update(){
  if(G.enemyIntro){ updateEnemyIntro(); return; }
  if(G.hitStop>0){ G.hitStop--; return; }
  if(G.paused) return;
  G.t++;
  const p=G.p;
  // player
  const acc=0.6, max=3.4*(p.slowT>0?0.55:1);        // JunkZilla grease slows you
  if(p.slowT>0) p.slowT--;
  if(Input.l){ p.vx=Math.max(p.vx-acc,-max); p.face=-1; }
  else if(Input.r){ p.vx=Math.min(p.vx+acc,max); p.face=1; }
  else { p.vx*=0.72; if(Math.abs(p.vx)<0.05)p.vx=0; }
  if(Input.jump && p.onGround){ p.vy=-11.8; p.onGround=false; Input.jump=false; playSfx('jump'); }
  p.vy=Math.min(p.vy+0.58, 13);
  p._ride=null;
  moveX(p,p.vx); moveY(p,p.vy);
  if(p.invuln>0) p.invuln--;
  // Checkpoint wherever you're standing — including moving platforms.
  if(p.onGround) G.lastSafe={x:p.x, y:p.y};
  if(p.y>H+160){ G.deathSpot=null; hurt(); respawn(); }

  // Combat power-ups: Seal Shot / Coverage Beam throw with X / F / ⚡
  if(p.shootCd>0) p.shootCd--;
  if(p.shieldT>0){
    p.shieldT--;
    if(p.shieldT===0){ toast('Coverage Shield expired'); updatePowHud(); }
    else if(p.shieldT%60===0) updatePowHud();
  }
  if(p.powT>0){
    p.powT--;
    if(p.powT===0){
      toast(p.powKind==='beam'?'Coverage Beam expired':'Seal Shot expired');
      p.powKind=null; setThrowBtn(false); updatePowHud();
    } else if(Input.throw && p.shootCd<=0){
      if(p.powKind==='beam'){
        G.shots.push({x:p.x+(p.face>0?p.w:-28), y:p.y+10, vx:p.face*11, vy:0, g:0,
          spr:'fx_beam', hostile:false, w:28, h:10, life:55, pierce:4, hits:0});
        p.shootCd=22;
      } else {
        G.shots.push({x:p.x+(p.face>0?p.w:-14), y:p.y+8, vx:p.face*6.5, vy:-1.2, g:0.1,
          spr:'fx_seal', hostile:false, w:14, h:14, life:90});
        p.shootCd=16;
      }
    }
    if(p.powT%60===0) updatePowHud();
  }
  Input.throw=false;

  // movers (and carry rider)
  for(const m of G.movers){
    const old=m.x;
    m.x += m.speed*m.dir;
    if(m.x>m.x0+m.range){m.x=m.x0+m.range;m.dir=-1;}
    if(m.x<m.x0){m.x=m.x0;m.dir=1;}
    const dx=m.x-old;
    if(p._ride===m) p.x+=dx;
  }

  // enemies — cartoon foes with tiny, readable behaviours
  // Opening grace: settle on ground only — no patrol, shots, or contact threat.
  const grace = enemiesInGrace();
  for(const e of G.enemies){
    if(e.dead) continue;
    if(grace){
      e.vy=Math.min(e.vy+0.58,13);
      moveY(e,e.vy);
      continue;
    }
    e.ai++;
    e.vy=Math.min(e.vy+0.58,13);
    const T=ETYPES[e.t]||ETYPES.sneezy;
    const dir=Math.sign(e.vx)||-1;

    if(e.t==='sneezy'){
      // gentle waddle; every few seconds: a-a-achoo! puff + tiny dash
      if(e.state==='dash'){
        if(e.ai>e.dashT+24){ e.state='walk'; e.vx=dir*T.speed; }
      } else if(e.ai%230===0){
        e.state='dash'; e.dashT=e.ai; e.vx=dir*2.4;
        spawnFx('fx_puff', e.x+(dir<0?-10:e.w), e.y+6, dir*1.2, -0.4, 34);
      }
    }
    else if(e.t==='bill'){
      // slow collector; lobs a rolled bill at you when you're in range
      const dx=(p.x+p.w/2)-(e.x+e.w/2);
      if(e.ai%210===0 && Math.abs(dx)<430 && Math.abs(p.y-e.y)<120){
        const d2=Math.sign(dx)||dir;
        e.vx=Math.abs(e.vx)*d2*-1*-1; // face the player
        G.shots.push({x:e.x+e.w/2, y:e.y+10, vx:d2*3.0, vy:-2.6, g:0.12,
          spr:'fx_bill', hostile:true, w:16, h:10, life:200, spin:true});
      }
    }
    else if(e.t==='junk'){
      // greasy zig-zag waddle
      e.vx = dir*(0.28 + 0.38*(Math.sin(e.ai/26)+1)/2 + 0.12);
    }
    else if(e.t==='bone'){
      // periodically collapses into a harmless pile, then reassembles
      if(e.state==='pile'){
        e.vx=0;
        if(e.ai>e.pileT+110){ e.state='walk'; e.vx=-T.speed*((e.ai%2)?1:-1); spawnFx('fx_puff', e.x+4, e.y+8, 0, -0.5, 26); }
      } else if(e.ai%260===0){
        e.state='pile'; e.pileT=e.ai;
        spawnFx('fx_bone', e.x-4, e.y+6, -1.2, -2, 40);
        spawnFx('fx_bone', e.x+e.w, e.y+4, 1.2, -2.2, 40);
      }
    }
    else if(e.t==='denier'){
      // steady patrol; shield faces travel direction
      if(e.state!=='walk') e.state='walk';
      e.vx = dir*T.speed;
    }
    else if(e.t==='spike'){
      // idle crate → leap when player near → short walk → idle again
      if(e.state==='idle'){
        e.vx=0;
        const dx=(p.x+p.w/2)-(e.x+e.w/2);
        if(Math.abs(dx)<95 && Math.abs(p.y-e.y)<110){
          e.state='leap'; e.vx=Math.sign(dx||dir)*2.1; e.vy=-8.2;
          spawnFx('fx_puff', e.x+4, e.y+e.h-4, 0, -0.6, 22);
        }
      } else if(e.state==='leap'){
        if(e.onGround && e.vy>=0){ e.state='walk'; e.walkT=e.ai; e.vx=(Math.sign(e.vx)||dir)*T.speed; }
      } else if(e.state==='walk'){
        if(e.ai>(e.walkT||0)+100){ e.state='idle'; e.vx=0; }
      } else e.state='idle';
    }

    // turn at ledges/walls (skip while collapsed or idle ambush)
    if(e.state!=='pile' && e.state!=='idle'){
      const ahead = e.vx<0 ? e.x-2 : e.x+e.w+2;
      if(e.onGround && !pointSolid(ahead, e.y+e.h+6)) e.vx*=-1;
      const pvx=e.vx;
      moveX(e,e.vx); if(e.vx===0 && e.state!=='leap'){e.vx=-pvx;}
    }
    moveY(e,e.vy);
    if(e.x>G.levelW-e.w-1||e.x<1) e.vx*=-1;

    // collide with player (a bone pile is harmless and can't be stomped)
    if(!e.dead && !(e.t==='bone'&&e.state==='pile') && overlap(p,e)){
      if(p.vy>1.5 && (p.y+p.h)-e.y < 14){
        if(e.t==='denier' && hitDenierFront(p,e)){
          p.vy=-6.5;
          addFloat(e.x+8, e.y-8, 'DENIED!');
          spawnFx('fx_puff', e.x+(e.vx>=0?e.w:-6), e.y+8, 0, -0.5, 24);
        } else {
          stompEnemy(e); p.vy=-7.5;
        }
      } else if(e.t==='junk'){
        if(G.t-e.cool>70){
          e.cool=G.t; p.slowT=160;
          spawnFx('fx_splash', p.x+2, p.y+12, 0, -0.8, 40);
          let msg='greased!';
          if(G.coinsGot>0){
            const steal=Math.min(2, G.coinsGot);
            G.coinsGot-=steal; updateHUD();
            msg='greased −'+steal+'◉';
          }
          addFloat(p.x+10, p.y-6, msg);
          p.vx = -p.face*2.2;
        }
      } else hurt();
    }
  }

  // projectiles (hostile bills + Seal Shot / Coverage Beam)
  for(const sh of G.shots){
    sh.vy+=sh.g; sh.x+=sh.vx; sh.y+=sh.vy; sh.life--;
    if(sh.life<=0 || sh.y>H+80){ sh.dead=true; continue; }
    if(pointSolid(sh.x+sh.w/2, sh.y+sh.h/2)){
      sh.dead=true; spawnFx('fx_puff', sh.x, sh.y, 0, -0.4, 22); continue;
    }
    if(sh.hostile){
      if(overlap(sh,p)){ sh.dead=true; hurt(); }
    } else {
      if(!sh._hit) sh._hit=new Set();
      for(const e of G.enemies){
        if(e.dead || (e.t==='bone'&&e.state==='pile') || sh._hit.has(e)) continue;
        if(overlap(sh,e)){
          sh._hit.add(e);
          stompEnemy(e);
          if(sh.pierce){
            sh.hits=(sh.hits||0)+1;
            if(sh.hits>=sh.pierce){ sh.dead=true; break; }
          } else { sh.dead=true; break; }
        }
      }
    }
  }
  if(G.shots.some(x=>x.dead)) G.shots=G.shots.filter(x=>!x.dead);

  // power-up pickups
  for(const pk of G.pickups){
    pk.vy=Math.min((pk.vy||0)+0.4, 6); pk.y+=pk.vy;
    if(pointSolid(pk.x+10, pk.y+pk.h+1)){ pk.y=Math.floor((pk.y+pk.h)/TILE)*TILE-pk.h; pk.vy=0; }
    if(!pk.got && overlap(pk,p)){
      pk.got=true;
      applyPowerup(pk.kind||'seal');
    }
  }
  if(G.pickups.some(x=>x.got)) G.pickups=G.pickups.filter(x=>!x.got);

  // sprite effects (puffs, splashes, shards)
  for(const q of G.fx){ q.vy+=0.06; q.x+=q.vx; q.y+=q.vy; q.life--; }
  G.fx=G.fx.filter(q=>q.life>0);

  // coins
  for(const c of G.coins){
    if(!c.got && overlap(p,c)){ c.got=true; G.coinsGot++; playSfx('coin'); addFloat(c.x,c.y,'◉'); updateHUD(); }
  }

  // proximity highlight — nothing auto-opens; tap it or press E to interact
  G.focus=null;
  if(!G.paused){
    const reach={x:p.x-80, y:p.y-110, w:p.w+160, h:p.h+170};
    let bd=1e9;
    for(const pr of (G.portals||[])){
      if(overlap(reach,pr)){
        const d=Math.abs((pr.x+pr.w/2)-(p.x+p.w/2));
        if(d<bd){ bd=d; G.focus={kind:'portal', o:pr}; }
      }
    }
    for(const s of G.stations){
      if(overlap(reach,s)){
        const d=Math.abs((s.x+s.w/2)-(p.x+p.w/2));
        if(d<bd){ bd=d; G.focus={kind:'station', o:s}; }
      }
    }
    for(const n of (G.npcs||[])){
      if(overlap(reach,n)){
        const d=Math.abs((n.x+n.w/2)-(p.x+p.w/2));
        if(d<bd){ bd=d; G.focus={kind:'npc', o:n}; }
      }
    }
  }

  // brick shards
  G.parts=(G.parts||[]).filter(q=>{ q.vy+=0.3; q.x+=q.vx; q.y+=q.vy; q.a-=0.03; return q.a>0; });

  // walk into a portal doorway → enter Focus Zone
  for(const pr of (G.portals||[])){
    if(!pr.entered && overlap(p, {x:pr.x+pr.w*0.28, y:pr.y+pr.h*0.35, w:pr.w*0.44, h:pr.h*0.65})){
      pr.entered=true;
      openPortal(pr);
    }
  }

  // flag (levels that still use it)
  if(G.flag){
    const f={x:G.flag.x, y:G.flag.y, w:32, h:64};
    if(overlap(p,f)) reachFlag();
  }

  // floats
  G.floats=(G.floats||[]).filter(fl=>{fl.y-=0.8; fl.a-=0.02; return fl.a>0;});

  G.cam=Math.max(0, Math.min(p.x - viewW()/2 + 40, Math.max(0, G.levelW - viewW())));
  G.camY=camYForGround();
  checkEnemyFirstViews();
}
function addFloat(x,y,t){ (G.floats=G.floats||[]).push({x,y,t,a:1}); }

let flagCooldown=0;
function reachFlag(){
  if(G.paused) return;
  if(G.t<flagCooldown) return;
  flagCooldown=G.t+60;
  const L=LEVELS[G.levelIdx];
  const missing=(L.required||[]).filter(t=>!G.done[t]);
  if(missing.length){
    toast('Still pending: '+missing.map(taskLabel).join(', ')+' — visit the highlighted boards!');
    return;
  }
  if(L.gate){ openGate(L.gate); return; }
  completeLevel();
}
function completeLevel(){
  if(G.levelResults) return; // already presenting
  try{ closeFocusZone(); }catch(e){}
  try{ closePlanChooser(); }catch(e){}
  try{ closeAddonBazaar(); }catch(e){}
  restoreGameCanvas();
  const levelSec = (performance.now()-G.levelStart)/1000;
  G.timeSpent += levelSec;
  const next=G.levelIdx+1;
  const clearedIdx=G.levelIdx;
  const sc=computeLevelScore(levelSec);
  playSfx('level'); juice(6, 0);
  toast('LEVEL CLEAR!');
  G.paused=true;
  Input.l=Input.r=Input.jump=false;
  // Fade to black, then reveal end-of-level scoreboard over this level's finish
  G.wipe=1; G.wipeDir=1;
  setTimeout(()=>{
    prepareLevelResultsScene();
    G.levelResults={ next, clearedIdx, sc, phase:'tally' };
    showLevelResultsUI(sc, clearedIdx);
    G.wipe=1; G.wipeDir=-1; // fade back in on the finish scene
  }, 620);
}

/** Park camera on the finishing object; hide side-view hero (front anim is HTML). */
function prepareLevelResultsScene(){
  const portal = (G.portals||[]).length ? G.portals[G.portals.length-1] : null;
  let focusX = G.levelW - W*0.5;
  if(portal) focusX = portal.x + portal.w*0.55;
  else if(G.flag) focusX = G.flag.x + 16;
  G.cam = Math.max(0, Math.min(Math.max(0, G.levelW - W), focusX - W*0.58));
  G.camY = camYForGround();
  // Park gameplay hero off-screen so only the front-facing celebrate sprite shows
  G.p.x = G.cam - 80;
  G.p.vx=0; G.p.vy=0;
}

function computeLevelScore(levelSec){
  const snap=G.levelSnap || {coinsGot:0, stomps:0, deaths:0};
  const coins=Math.max(0, G.coinsGot - (snap.coinsGot|0));
  const stomps=Math.max(0, G.stomps - (snap.stomps|0));
  const deaths=Math.max(0, G.deaths - (snap.deaths|0));
  const sec=Math.max(0, levelSec|0);
  const parts=[
    {label:'Level clear', pts:500},
    {label:'Coins collected ('+coins+')', pts:coins*50},
    {label:'Enemies stomped ('+stomps+')', pts:stomps*150},
    {label:'Time bonus', pts:Math.max(0, 500 - sec*4)},
    {label:'Knocked out ('+deaths+')', pts:-deaths*200},
  ];
  const focusParts=focusChoiceParts(G.levelIdx);
  const playTotal=parts.reduce((s,p)=>s+p.pts,0);
  const focusTotal=focusParts.reduce((s,p)=>s+p.pts,0);
  const total=Math.max(0, playTotal+focusTotal);
  // Higher bands — focus choices can add a lot
  const grade = total>=1500?'S' : total>=1100?'A' : total>=750?'B' : 'C';
  return {parts, focusParts, total, grade, coins, stomps, deaths, sec};
}

/** Bonus points for enrolment choices made in this level's focus area. */
function focusChoiceParts(levelIdx){
  const L=LEVELS[levelIdx]||{};
  const portalKind=((L.portals||[])[0]||{}).kind;
  const out=[];

  if(portalKind==='family' || (L.required||[]).includes('coverConfirm')){
    const deps=Enrol.dependants.length;
    const coveredExtra=Math.max(0, coveredMembers().length-1);
    if(deps) out.push({label:'Family joined ('+deps+')', pts:deps*220});
    if(coveredExtra) out.push({label:'Extra people covered ('+coveredExtra+')', pts:coveredExtra*180});
    if(!deps) out.push({label:'Solo cover started', pts:80});
  }

  if(portalKind==='gmc' || (L.required||[]).includes('gmc')){
    if(Enrol.gmc){
      const id=String(Enrol.gmc.planId||'');
      if(id.includes('diamond')) out.push({label:'Diamond medical plan', pts:520});
      else if(id.includes('gold')) out.push({label:'Gold medical plan', pts:360});
      else out.push({label:'Base medical plan', pts:160});
      const si=Enrol.gmc.si|0;
      if(si>=1000000) out.push({label:'Highest sum insured', pts:220});
      else if(si>=750000) out.push({label:'Stronger sum insured', pts:120});
    }
  }

  if(portalKind==='addon' || (L.required||[]).includes('addon')){
    const n=Enrol.addons.length;
    if(n) out.push({label:'Add-ons selected ('+n+')', pts:n*200});
    if(n>=3) out.push({label:'Wellbeing explorer bonus', pts:180});
    if(!n) out.push({label:'Travelled light (no add-ons)', pts:40});
  }

  if(L.flag!=null || (L.required||[]).includes('gtl') || (L.required||[]).includes('nominees')){
    if(Enrol.gtl){
      const id=String(Enrol.gtl.planId||'');
      if(id.includes('50') || (Enrol.gtl.si|0)>=5000000) out.push({label:'Higher term-life cover', pts:320});
      else out.push({label:'Term-life cover chosen', pts:160});
    }
    const nn=Enrol.nominees.length;
    if(nn) out.push({label:'Nominees added ('+nn+')', pts:nn*150});
  }

  return out;
}

let _lrHeroTimer=null;
let _lrTallyTimers=[];

function clearLevelResultsTimers(){
  if(_lrHeroTimer){ clearInterval(_lrHeroTimer); _lrHeroTimer=null; }
  _lrTallyTimers.forEach(id=>clearTimeout(id));
  _lrTallyTimers=[];
}

function hideLevelResultsUI(){
  clearLevelResultsTimers();
  const el=document.getElementById('levelResultsUI');
  if(el){
    el.hidden=true;
    el.classList.remove('fadeBlack');
  }
  G.levelResults=null;
}

function showLevelResultsUI(sc, clearedIdx){
  clearLevelResultsTimers();
  const el=document.getElementById('levelResultsUI');
  if(!el) return;
  el.classList.remove('fadeBlack');
  el.hidden=false;
  const L=LEVELS[clearedIdx];
  const eyebrow=document.getElementById('lrEyebrow');
  const title=document.getElementById('lrTitle');
  const partsEl=document.getElementById('lrParts');
  const totalEl=document.getElementById('lrTotal');
  const totalPts=document.getElementById('lrTotalPts');
  const rankEl=document.getElementById('lrRank');
  const gradeEl=document.getElementById('lrRankGrade');
  const caption=document.getElementById('lrHeroCaption');
  if(eyebrow) eyebrow.textContent='Level '+(clearedIdx+1)+' clear';
  if(title) title.textContent=(L&&L.name) ? L.name : ('Level '+(clearedIdx+1));
  if(caption) caption.textContent='Nice clear!';
  if(totalEl) totalEl.hidden=false;
  if(rankEl) rankEl.hidden=true;
  if(totalPts) totalPts.textContent='0';
  if(gradeEl) gradeEl.textContent=sc.grade;
  const focusWrap=document.getElementById('lrFocus');
  const focusPartsEl=document.getElementById('lrFocusParts');
  const allRows=[
    ...sc.parts.map(p=>({...p, kind:'play'})),
    ...(sc.focusParts||[]).map(p=>({...p, kind:'focus'})),
  ];
  if(partsEl){
    partsEl.innerHTML = sc.parts.map((p,i)=>
      '<li data-row="'+i+'" class="'+(p.pts<0?'neg':'')+'">'+
        '<span class="lrLabel">'+p.label+'</span>'+
        '<span class="lrPts">0</span>'+
      '</li>'
    ).join('');
  }
  if(focusWrap && focusPartsEl){
    const fp=sc.focusParts||[];
    if(fp.length){
      focusWrap.hidden=false;
      focusPartsEl.innerHTML = fp.map((p,i)=>
        '<li data-row="'+(sc.parts.length+i)+'" class="focus'+(p.pts<0?' neg':'')+'">'+
          '<span class="lrLabel">'+p.label+'</span>'+
          '<span class="lrPts">0</span>'+
        '</li>'
      ).join('');
    } else {
      focusWrap.hidden=true;
      focusPartsEl.innerHTML='';
    }
  }

  // Front-facing celebrate loop (same packs as setup / title)
  let tick=0;
  const paint=()=>{
    const c=document.getElementById('lrHeroCv'); if(!c) return;
    paintSetupHeroPreview(c, tick++);
  };
  paint();
  _lrHeroTimer=setInterval(paint, 90);

  // Count each category rapidly, with a stream of metallic coin clinks.
  let running=0;
  const tallyStart=260;
  const lineDelay=520;
  const countDuration=500;
  const formatSigned=n=>(n>0?'+':'')+n;
  const rowHost=i=>{
    if(i<sc.parts.length) return partsEl && partsEl.querySelector('li[data-row="'+i+'"]');
    return focusPartsEl && focusPartsEl.querySelector('li[data-row="'+i+'"]');
  };
  allRows.forEach((p,i)=>{
    const id=setTimeout(()=>{
      const li=rowHost(i);
      if(li) li.classList.add('show');
      const ptsEl=li && li.querySelector('.lrPts');
      if(p.pts===0){
        if(ptsEl) ptsEl.textContent='0';
        return;
      }
      const base=running;
      const started=performance.now();
      let soundStep=-1;
      const count=now=>{
        const progress=Math.min(1, (now-started)/countDuration);
        const eased=1-Math.pow(1-progress, 3);
        const shown=Math.round(p.pts*eased);
        if(ptsEl) ptsEl.textContent=formatSigned(shown);
        if(totalPts) totalPts.textContent=String(Math.max(0, base+shown));
        const step=Math.floor(progress*16);
        if(p.pts>0 && step!==soundStep && step%2===0){
          soundStep=step;
          playSfx('score');
        }
        if(progress<1){
          const timer=setTimeout(()=>count(performance.now()), 28);
          _lrTallyTimers.push(timer);
        } else {
          running=base+p.pts;
          if(ptsEl) ptsEl.textContent=formatSigned(p.pts);
          if(totalPts) totalPts.textContent=String(Math.max(0, running));
        }
      };
      count(started);
    }, tallyStart + i*lineDelay);
    _lrTallyTimers.push(id);
  });

  const afterParts = tallyStart + Math.max(0, allRows.length-1)*lineDelay + countDuration + 220;
  _lrTallyTimers.push(setTimeout(()=>{
    if(totalPts) totalPts.textContent=String(sc.total);
    playSfx('confirm');
  }, afterParts));
  _lrTallyTimers.push(setTimeout(()=>{
    if(rankEl) rankEl.hidden=false;
    playSfx('flag');
  }, afterParts + 380));

  // Hold the board, then fade out and advance
  const holdMs = afterParts + 380 + 1600;
  _lrTallyTimers.push(setTimeout(()=>finishLevelResultsAndAdvance(), holdMs));
}

function finishLevelResultsAndAdvance(){
  const lr=G.levelResults;
  if(!lr || lr.phase==='leaving') return;
  lr.phase='leaving';
  const resultsEl=document.getElementById('levelResultsUI');
  if(resultsEl) resultsEl.classList.add('fadeBlack');
  G.wipe=1; G.wipeDir=1;
  setTimeout(()=>{
    const next=lr.next;
    hideLevelResultsUI();
    if(next>=LEVELS.length){
      G.wipe=0; G.paused=false;
      showSummary();
    } else {
      buildLevel(next);
      G.wipeDir=-1; G.wipe=1;
      G.introT=180;
      setTimeout(()=>{ G.wipe=0; G.paused=false; }, 420);
    }
  }, 650);
}

function render(){
  ctx.clearRect(0,0,W,H);
  applyBaseTransform();
  // screen shake
  if(G.shake>0){
    const mag=G.shake*0.45;
    ctx.translate((Math.random()-0.5)*mag, (Math.random()-0.5)*mag);
    G.shake--;
  }
  const L=LEVELS[G.levelIdx]||LEVELS[0];
  // background (sky plate under parallax hills)
  const bg=Sprites.frames[G.state==='title'?'bg_title':L.bg];
  if(bg){
    if(G._skySrc!==bg[0]){   // pre-scale the sky once; per-frame it's a plain blit
      G._skySrc=bg[0];
      const cvs=document.createElement('canvas'); cvs.width=W*RES; cvs.height=H*RES;
      const g=cvs.getContext('2d'); g.imageSmoothingEnabled=true; g.imageSmoothingQuality='high';
      g.drawImage(bg[0],0,0,W*RES,H*RES);
      G._skyCv=cvs;
    }
    drawSoftPlate(G._skyCv,0,0,W,H);
  }
  if(G.state==='title'){ renderTitleScene(); return; }
  // Zoomed play camera — world coords → screen (boosted during enemy intros)
  const cam=G.cam, camY=G.camY||0;
  const zoom = playZoom();
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(0, -camY);

  drawParallax();                    // far hills / mid hills+pines / near bushes

  // clouds & birds
  for(const c of G.clouds){
    const sx=((c.x - cam*0.5)%(G.levelW+400));
    Sprites.draw(ctx,'cloud',0, sx, c.y, 1.4);
  }
  const afWorld=Math.floor(G.t/7)%5;
  const afHold = G.enemyIntro ? (G.enemyIntro.freezeAf|0) : afWorld;
  for(const b of G.birds){
    if(!G.enemyIntro){ b.x+=b.v; if(b.x>G.levelW+40)b.x=-40; }
    Sprites.draw(ctx,'bird', afHold, b.x-cam*0.8, b.y+Math.sin((G.enemyIntro?G.enemyIntro.freezeAf:G.t)/30+b.ph)*8, 1.3);
  }
  // terrain
  const visR = cam + (W/zoom) + TILE*2;
  const visL = cam - TILE*2;
  for(const s of G.solids){
    if(s.x > visR || s.x+s.w < visL) continue;      // offscreen
    if(s.brick){
      Sprites.draw(ctx, s.brick.type==='soft'?'tile_brick':'tile_metal', 0, s.x-cam, s.y);
      continue;
    }
    const xStart = s.x + Math.max(0, Math.floor((cam-TILE-s.x)/TILE)+1)*TILE;
    const xEnd   = Math.min(s.x+s.w, cam+viewW()+TILE);
    if(s.plat){
      for(let x=xStart; x<xEnd; x+=TILE) Sprites.draw(ctx,'tile_platform',0,x-cam,s.y);
    } else {
      const yEnd=Math.min(s.y+s.h, H+TILE);
      for(let x=xStart; x<xEnd; x+=TILE)
        for(let y=s.y; y<yEnd; y+=TILE)
          Sprites.draw(ctx, y===s.y?'tile_top':'tile_ground', 0, x-cam, y);
    }
  }
  for(const m of G.movers)
    for(let x=0;x<m.w;x+=TILE) Sprites.draw(ctx,'tile_platform',0,m.x+x-cam,m.y);

  // flag (optional — L1 uses cottage portal instead)
  if(G.flag){
    const fs=spriteLogicalSize('flag', ACTOR_SCALE*0.85);
    Sprites.draw(ctx,'flag',0, G.flag.x-cam, G.flag.y+64-fs.h, ACTOR_SCALE*0.85);
  }
  // coins
  for(const c of G.coins) if(!c.got && c.x>visL && c.x<visR){
    drawActor(ctx,'coin',afHold, c.x+c.w/2, c.y+c.h, cam, 0, ITEM_SCALE, false);
  }
  // enrolment info boards (big, readable, tap or press E)
  for(const st of G.stations) drawBoard(st, cam);

  // Focus Zone portals (cottage / structure entrances)
  for(const lm of (G.landmarks||[])) drawLandmark(lm, cam);
  for(const pr of (G.portals||[])) drawPortal(pr, cam);

  // family members standing near the level end (legacy — unused on L1 now)
  if((G.npcs||[]).length){
    for(const n of G.npcs) drawFamilyFig(n, Enrol.dependants.find(d=>d.slot===n.slot), cam);
    if(Math.abs(G.p.x - G.npcs[0].x) < 820){
      const fx=(G.npcs[0].x + G.npcs[G.npcs.length-1].x)/2 - cam + 16;
      drawPlate(fx, GROUND_Y-190, 'YOUR FAMILY — GO NEAR & TAP TO ADD OR EDIT', '#ffd24a');
    }
  }

  // enemies
  for(const e of G.enemies){
    if(e.x<visL-40 || e.x>visR+40) continue;
    const key='enemy_'+e.t;
    const af = enemyIntroFrame(e);
    if(e.dead){
      if(G.t-e.deadT<22){          // brief cartoon squash on defeat
        ctx.save(); ctx.globalAlpha=0.75;
        ctx.translate(e.x+e.w/2-cam, e.y+e.h); ctx.scale(ACTOR_SCALE,0.3*ACTOR_SCALE);
        const sz=spriteLogicalSize(key, 1);
        Sprites.draw(ctx,key,0, -sz.w/2, -sz.h, 1, false);
        ctx.restore(); ctx.globalAlpha=1;
      }
      continue;
    }
    const spotlight = G.enemyIntro && G.enemyIntro.enemy===e;
    const flip = spotlight ? (G.enemyIntro.faceDir>0) : (e.vx>0);
    if(spotlight){
      const pulse = 0.35 + 0.25*Math.sin(G.t/6);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ffd24a';
      ctx.beginPath();
      ctx.ellipse(e.x+e.w/2-cam, e.y+e.h-4, 22, 8, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
    if(e.t==='bone' && e.state==='pile'){
      drawActor(ctx,'enemy_bone_pile',0, e.x+e.w/2, e.y+e.h, cam, 0, ACTOR_SCALE, false);
      continue;
    }
    if(e.t==='spike' && e.state==='idle' && !spotlight){
      // crouched crate look — slightly squashed
      ctx.save();
      ctx.translate(e.x+e.w/2-cam, e.y+e.h);
      ctx.scale(ACTOR_SCALE, ACTOR_SCALE*0.72);
      const sz=spriteLogicalSize('enemy_spike', 1);
      Sprites.draw(ctx,'enemy_spike', af, -sz.w/2, -sz.h, 1, flip);
      ctx.restore();
      continue;
    }
    drawActor(ctx, key, af, e.x+e.w/2, e.y+e.h, cam, 0, ACTOR_SCALE, flip);
  }

  // projectiles
  for(const sh2 of (G.shots||[])){
    if(sh2.x<visL||sh2.x>visR) continue;
    Sprites.draw(ctx, sh2.spr, 0, sh2.x-cam, sh2.y, ITEM_SCALE, sh2.vx>0);
  }
  // power-up pickups (bob when settled)
  for(const pk of (G.pickups||[])){
    const bob = pk.vy===0 ? Math.sin(G.t/9)*2.5 : 0;
    const spr = pk.kind==='beam' ? 'pickup_beam' : pk.kind==='shield' ? 'pickup_shield' : 'pickup_kit';
    drawActor(ctx, spr, 0, pk.x+pk.w/2, pk.y+pk.h+bob, cam, 0, ITEM_SCALE, false);
    if(pk.vy===0){
      const sz=spriteLogicalSize(spr, ITEM_SCALE);
      const ring = pk.kind==='beam' ? '#5fe0e8' : pk.kind==='shield' ? '#5a8af0' : '#ffd24a';
      ctx.globalAlpha=0.5+0.3*Math.sin(G.t/7); ctx.strokeStyle=ring; ctx.lineWidth=2;
      ctx.strokeRect(pk.x+pk.w/2-sz.w/2-cam-4, pk.y+pk.h+bob-sz.h-4, sz.w+8, sz.h+8); ctx.globalAlpha=1;
    }
  }
  // sprite effects
  for(const q of (G.fx||[])){
    ctx.globalAlpha=Math.max(0, q.life/q.life0);
    Sprites.draw(ctx, q.spr, 0, q.x-cam, q.y, ITEM_SCALE);
    ctx.globalAlpha=1;
  }
  // player — feet on hitbox bottom so a bigger sprite still stands on the ground
  // During level-results, front-facing celebrate sprite is on the HTML overlay instead
  const p=G.p;
  if(!G.levelResults){
  if(p.shieldT>0){
    ctx.globalAlpha=0.25+0.15*Math.sin(G.t/8);
    ctx.strokeStyle='#5a8af0'; ctx.lineWidth=2;
    ctx.beginPath();
    ctx.ellipse(p.x+p.w/2-cam, p.y+p.h/2, 20, 24, 0, 0, Math.PI*2);
    ctx.stroke(); ctx.globalAlpha=1;
  }
  if(!(p.invuln>0 && Math.floor(G.t/4)%2===0)){
    const key = !p.onGround ? 'player_jump' : (Math.abs(p.vx)>0.3?'player_run':'player_idle');
    const pAf = G.enemyIntro ? (G.enemyIntro.freezeAf|0) : afWorld;
    drawActor(ctx, key, pAf, p.x+p.w/2, p.y+p.h, cam, 0, ACTOR_SCALE, p.face<0);
  }
  }
  // floats
  for(const fl of (G.floats||[])){
    ctx.globalAlpha=fl.a; ctx.font='700 13px Fredoka, system-ui, sans-serif'; ctx.textAlign='center';
    ctx.lineWidth=3; ctx.lineJoin='round'; ctx.strokeStyle='#2a1408';
    ctx.strokeText(fl.t, fl.x-cam, fl.y);
    ctx.fillStyle='#ffd24a'; ctx.fillText(fl.t, fl.x-cam, fl.y); ctx.globalAlpha=1;
  }
  // brick shards
  for(const q of (G.parts||[])){
    ctx.globalAlpha=Math.max(0,q.a); ctx.fillStyle='#b5563a';
    ctx.fillRect(q.x-cam-2, q.y-2, 5, 5); ctx.globalAlpha=1;
  }
  ctx.restore(); // end VIEW_ZOOM

  // level wipe / intro banner (screen space, not zoomed)
  if(typeof G.wipe==='number' && G.wipe>0){
    G.wipe = Math.max(0, G.wipe - 0.045);
    const a = G.wipeDir>0 ? (1-G.wipe) : G.wipe;
    ctx.fillStyle='rgba(12,6,24,'+Math.min(1,Math.max(0,a))+')';
    ctx.fillRect(0,0,W,H);
  }
  if(G.introT>0){
    G.introT--;
    const L2=LEVELS[G.levelIdx];
    ctx.fillStyle='rgba(139,90,43,.88)'; ctx.fillRect(0, H*0.38, W, 70);
    ctx.fillStyle='#fff04a'; ctx.font='700 22px Fredoka, system-ui, sans-serif'; ctx.textAlign='center';
    ctx.fillText((L2&&L2.name)||('LEVEL '+(G.levelIdx+1)), W/2, H*0.38+42);
  }
}

/* ---------- signage, info-board & family figure painters ----------
   PERFORMANCE: board panels are pre-rendered to offscreen canvases and
   only repainted when their state changes (chosen / taken / count). Per
   frame each board costs a single drawImage. No canvas shadows anywhere —
   glows are cheap layered strokes. Text widths are memoised. */
function siShort(si){ return '\u20B9'+(si/100000)+'L'; }
function siPriceText(si){
  const ps=plansAtSI(si).map(o=>o.tier.prem);
  const mn=Math.min.apply(null, ps);
  return mn===0 ? 'FREE' : 'from '+fmtINR(mn)+'/yr';
}
function siIsFree(si){ return plansAtSI(si).some(o=>o.tier.prem===0); }

const _plateW=new Map();
function drawPlate(cx, y, text, col){
  let w=_plateW.get(text);
  if(w===undefined){ ctx.font='700 11px Fredoka, system-ui, sans-serif'; w=ctx.measureText(text).width+16; _plateW.set(text,w); }
  ctx.fillStyle='#8b5a2b'; ctx.fillRect(cx-w/2, y-15, w, 20);
  ctx.fillStyle='#c4894a'; ctx.fillRect(cx-w/2+3, y-12, w-6, 14);
  ctx.strokeStyle='#3d2210'; ctx.lineWidth=2; ctx.strokeRect(cx-w/2+0.5, y-14.5, w-1, 19);
  ctx.fillStyle=(col==='#ffd24a' || col==='#fff04a') ? '#5a3208' : col;
  ctx.font='700 11px Fredoka, system-ui, sans-serif'; ctx.textAlign='center'; ctx.fillText(text, cx, y);
}
function wrapLines(g, text, maxW, font){
  g.font=font;
  const words=String(text).split(' '); const out=[]; let line='';
  for(const w0 of words){
    const t=line?line+' '+w0:w0;
    if(g.measureText(t).width>maxW && line){ out.push(line); line=w0; }
    else line=t;
  }
  if(line) out.push(line);
  return out;
}
function drawAddonIcon(g, id, cx, cy, sc){
  g.save(); g.translate(cx, cy); g.scale(sc||1, sc||1);
  if(id==='womens_care'){
    g.strokeStyle='#ff8ad8'; g.lineWidth=2.4;
    g.beginPath(); g.arc(0,-3,5,0,7); g.stroke();
    g.beginPath(); g.moveTo(0,2); g.lineTo(0,9); g.moveTo(-3.5,5.5); g.lineTo(3.5,5.5); g.stroke();
  } else if(id==='dental_vision'){
    g.fillStyle='#fff';
    g.beginPath(); g.arc(-3,-2,5,Math.PI,0); g.arc(3,-2,5,Math.PI,0);
    g.lineTo(6,4); g.lineTo(3,9); g.lineTo(1,4); g.lineTo(-1,9); g.lineTo(-4,4); g.closePath(); g.fill();
  } else if(id==='opd_wallet'){
    g.fillStyle='#c98a2e'; g.fillRect(-9,-6,18,13);
    g.fillStyle='#e8b054'; g.fillRect(-9,-6,18,4);
    g.fillStyle='#2a1a08'; g.font='bold 10px monospace'; g.textAlign='center';
    g.fillText('\u20B9', 0, 6);
  } else if(id==='parent_screen'){
    g.fillStyle='#ff5d6c';
    g.beginPath(); g.arc(-3.5,-2,4.5,0,7); g.arc(3.5,-2,4.5,0,7);
    g.moveTo(-7.5,0); g.lineTo(0,9); g.lineTo(7.5,0); g.closePath(); g.fill();
    g.strokeStyle='#fff'; g.lineWidth=1.4;
    g.beginPath(); g.moveTo(-6,0); g.lineTo(-2,0); g.lineTo(0,-3); g.lineTo(2,2); g.lineTo(4,0); g.lineTo(6,0); g.stroke();
  } else if(id==='gtl'){
    g.fillStyle='#5cc8ff';
    g.beginPath(); g.moveTo(0,-9); g.lineTo(8,-5); g.lineTo(8,2); g.lineTo(0,10); g.lineTo(-8,2); g.lineTo(-8,-5); g.closePath(); g.fill();
    g.strokeStyle='#fff'; g.lineWidth=2;
    g.beginPath(); g.moveTo(-3.5,0); g.lineTo(-1,3); g.lineTo(4,-3.5); g.stroke();
  } else if(id==='nominees'){
    g.fillStyle='#ffd24a';
    g.beginPath(); g.arc(-4,-4,3.6,0,7); g.fill(); g.fillRect(-8,0,8,8);
    g.fillStyle='#ff8ad8';
    g.beginPath(); g.arc(4.5,-2.6,3,0,7); g.fill(); g.fillRect(1.4,1,6.4,7);
  }
  g.restore();
}
function boardFrame(g, w, h, border){
  g.fillStyle='#5c3d22'; g.fillRect(10, h-12, 7, 12); g.fillRect(w-17, h-12, 7, 12);
  g.fillStyle='#7a532f'; g.fillRect(10, h-12, 3, 12);  g.fillRect(w-17, h-12, 3, 12);
  g.fillStyle='#8b5a2b'; g.fillRect(0, 0, w, h-12);
  g.fillStyle='#c4894a'; g.fillRect(4, 4, w-8, h-20);
  g.lineWidth=3; g.strokeStyle='#3d2210'; g.strokeRect(1.5, 1.5, w-3, h-15);
  g.lineWidth=2; g.strokeStyle=border||'#f0d090'; g.strokeRect(5, 5, w-10, h-22);
}
function paintBoard(g, st){
  const w=st.w, h=st.h, t=st.task, cx=w/2;
  g.textAlign='center';
  if(t.startsWith('gmc_si_')){
    const si=+t.slice(7);
    const chosen=!!(Enrol.gmc && Enrol.gmc.si===si);
    boardFrame(g, w, h, chosen?'#5fe08a':'#5cc8ff');
    g.fillStyle='#2a1408'; g.font='700 9px Fredoka, system-ui, sans-serif';  g.fillText('MEDICAL COVER', cx, 15);
    g.fillStyle='#5a3208'; g.font='700 24px Fredoka, system-ui, sans-serif'; g.fillText(siShort(si), cx, 45);
    g.fillStyle='#5a3208'; g.font='600 8px Fredoka, system-ui, sans-serif';       g.fillText('sum insured', cx, 56);
    g.fillStyle='#3d2210'; g.font='600 9px Fredoka, system-ui, sans-serif'; g.fillText('compare in clinic', cx, 74);
    if(chosen){ g.fillStyle='#145828'; g.font='700 11px Fredoka, system-ui, sans-serif'; g.fillText('\u2713 CHOSEN', cx, h-20); }
    else{ g.fillStyle='#3d2210'; g.font='600 8px Fredoka, system-ui, sans-serif'; g.fillText('tap to view plans', cx, h-20); }
  }
  else if(t.startsWith('addon_')){
    const A=CONFIG.addons.find(a=>a.id===t.slice(6));
    const on=Enrol.addons.some(a=>a.id===A.id);
    const seen=!!G.done[t];
    boardFrame(g, w, h, on?'#5fe08a':'#ff8ad8');
    g.fillStyle='#8a2060'; g.font='700 9px Fredoka, system-ui, sans-serif'; g.fillText('ADD-ON', cx, 14);
    drawAddonIcon(g, t.slice(6), cx, 31, 1.25);
    g.fillStyle='#5a3208'; g.font='700 10px Fredoka, system-ui, sans-serif';
    wrapLines(g, A.name.toUpperCase(), w-12, '700 10px Fredoka, system-ui, sans-serif')
      .slice(0,2).forEach((ln,i)=>{ g.font='700 10px Fredoka, system-ui, sans-serif'; g.fillText(ln, cx, 55+i*11); });
    g.fillStyle='#5a3208';
    wrapLines(g, A.eligNote, w-12, '600 8px Fredoka, system-ui, sans-serif')
      .slice(0,2).forEach((ln,i)=>{ g.font='600 8px Fredoka, system-ui, sans-serif'; g.fillText(ln, cx, 80+i*9); });
    if(on){ g.fillStyle='#145828'; g.font='700 10px Fredoka, system-ui, sans-serif'; g.fillText('\u2713 TAKEN', cx, 101); }
    else if(seen){ g.fillStyle='#5a3208'; g.font='600 8px Fredoka, system-ui, sans-serif'; g.fillText('skipped \u00b7 tap to change', cx, 101); }
    g.fillStyle='#5a3208'; g.font='600 9px Fredoka, system-ui, sans-serif';
    g.fillText(A.per==='family'?'Whole family':'Per member', cx, h-16);
  }
  else if(t==='gtl'){
    const chosen=Enrol.gtl;
    boardFrame(g, w, h, chosen?'#5fe08a':'#5cc8ff');
    g.fillStyle='#145a90'; g.font='700 9px Fredoka, system-ui, sans-serif'; g.fillText('TERM LIFE', cx, 14);
    drawAddonIcon(g, 'gtl', cx, 32, 1.25);
    const sis=CONFIG.gtlPlans.map(x=>siShort(x.si));
    g.fillStyle='#5a3208'; g.font='700 13px Fredoka, system-ui, sans-serif'; g.fillText(sis.join(' / '), cx, 58);
    g.fillStyle='#5a3208'; g.font='600 9px Fredoka, system-ui, sans-serif';
    g.fillText('choose a cover', cx, 74);
    if(chosen){ g.fillStyle='#145828'; g.font='700 10px Fredoka, system-ui, sans-serif'; g.fillText('\u2713 '+siShort(chosen.si), cx, h-20); }
    else{ g.fillStyle='#3d2210'; g.font='600 8px Fredoka, system-ui, sans-serif'; g.fillText('tap to pick cover', cx, h-20); }
  }
  else if(t==='nominees'){
    const nn=Enrol.nominees.length;
    boardFrame(g, w, h, nn?'#5fe08a':'#ffd24a');
    g.fillStyle='#5a3208'; g.font='700 9px Fredoka, system-ui, sans-serif'; g.fillText('TERM LIFE', cx, 14);
    drawAddonIcon(g, 'nominees', cx, 32, 1.3);
    g.fillStyle='#5a3208'; g.font='700 12px Fredoka, system-ui, sans-serif'; g.fillText('NOMINEES', cx, 56);
    g.fillStyle='#5a3208'; g.font='600 8px Fredoka, system-ui, sans-serif'; g.fillText('who receives the cover', cx, 70);
    if(nn){ g.fillStyle='#145828'; g.font='700 10px Fredoka, system-ui, sans-serif'; g.fillText('\u2713 '+nn+' added', cx, h-20); }
    else{ g.fillStyle='#8a2020'; g.font='700 8px Fredoka, system-ui, sans-serif'; g.fillText('required \u00b7 tap to add', cx, h-20); }
  }
}
const BoardCache=new Map();
function boardKey(st){
  const t=st.task;
  if(t.startsWith('gmc_si_')) return t+':'+((Enrol.gmc&&Enrol.gmc.si===+t.slice(7))?'1':'0');
  if(t.startsWith('addon_')){
    const on=Enrol.addons.some(a=>'addon_'+a.id===t);
    return t+':'+(on?'on':(G.done[t]?'seen':'0'));
  }
  if(t==='gtl') return t+':'+(Enrol.gtl?Enrol.gtl.si:'0');
  if(t==='nominees') return t+':'+Enrol.nominees.length;
  return t;
}
function boardCanvas(st){
  const k=boardKey(st);
  let cv=BoardCache.get(k);
  if(!cv){
    cv=document.createElement('canvas'); cv.width=st.w*RES; cv.height=st.h*RES;
    const g=cv.getContext('2d'); g.scale(RES,RES);
    paintBoard(g, st);
    BoardCache.set(k, cv);
  }
  return cv;
}
function focusGlow(x, y, w, h){
  const pul=(Math.sin(G.t/6)+1)/2;
  ctx.lineWidth=3; ctx.strokeStyle='#ffd24a'; ctx.strokeRect(x+0.5, y+0.5, w-1, h-1);
  ctx.globalAlpha=0.25+0.45*pul; ctx.lineWidth=5;
  ctx.strokeRect(x-3.5, y-3.5, w+7, h+7);
  ctx.globalAlpha=1;
}
function drawBoard(st, cam){
  const x=Math.round(st.x-cam), y=Math.round(st.y);
  if(x+st.w<-20 || x>W+20) return;
  ctx.drawImage(boardCanvas(st), x, y, st.w, st.h);
  if(G.focus && G.focus.o===st && !G.paused){
    focusGlow(x, y, st.w, st.h-12);
    drawPlate(x+st.w/2, y-10, 'TAP \u00b7 or press E', '#ffd24a');
  }
}
function drawLandmark(lm, cam){
  const x=Math.round(lm.x-cam), y=Math.round(lm.y);
  if(x+lm.w<-40 || x>W+40) return;
  const hasArt=!QUARANTINED_LANDMARKS.has(lm.key)
    && USE_AUTHORED_WORLD_LAYERS
    && (Sprites.authored[lm.key]||Sprites.custom[lm.key]) && Sprites.frames[lm.key];
  if(hasArt){
    Sprites.drawSoft(ctx, lm.key, 0, lm.x-cam, lm.y, LANDMARK_SCALE);
    return;
  }
  // fallback: terracotta path arch (scales with landmark box; real art later)
  const pw=Math.max(10, Math.round(lm.w*0.12));
  const beam=Math.max(10, Math.round(lm.h*0.1));
  const top=Math.round(lm.h*0.12);
  ctx.fillStyle='#8a5533';
  ctx.fillRect(x+Math.round(lm.w*0.08), y+top, pw, lm.h-top);
  ctx.fillRect(x+lm.w-Math.round(lm.w*0.08)-pw, y+top, pw, lm.h-top);
  ctx.fillStyle='#c4784a';
  ctx.fillRect(x+Math.round(lm.w*0.04), y+Math.round(lm.h*0.08), lm.w-Math.round(lm.w*0.08), beam);
  ctx.fillStyle='#2f8a4c';
  ctx.fillRect(x+Math.round(lm.w*0.18), y+Math.round(lm.h*0.02), Math.round(lm.w*0.64), Math.round(beam*0.55));
}
function drawPortal(pr, cam){
  const x=Math.round(pr.x-cam), y=Math.round(pr.y);
  if(x+pr.w<-80 || x>W+80) return;
  const w=pr.w, h=pr.h;
  const lmKey=pr.landmark;
  const hasArt=lmKey && (Sprites.authored[lmKey]||Sprites.custom[lmKey]) && Sprites.frames[lmKey];
  if(hasArt){
    Sprites.drawSoft(ctx, lmKey, 0, pr.x-cam, pr.y, LANDMARK_SCALE);
  } else {
    // procedural cottage body
    ctx.fillStyle='#6b3f24';
    ctx.fillRect(x+8, y+36, w-16, h-36);
    ctx.fillStyle='#8a5533';
    ctx.fillRect(x+8, y+36, 6, h-36);
    ctx.fillStyle='#3d5c38';
    ctx.beginPath();
    ctx.moveTo(x+2, y+40);
    ctx.lineTo(x+w/2, y+6);
    ctx.lineTo(x+w-2, y+40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#2f8a4c';
    ctx.beginPath();
    ctx.moveTo(x+8, y+40);
    ctx.lineTo(x+w/2, y+14);
    ctx.lineTo(x+w-8, y+40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#0e1618';
    ctx.fillRect(x+w*0.32, y+h*0.45, w*0.36, h*0.55);
    ctx.fillStyle='#1E8F8E';
    ctx.fillRect(x+w*0.32, y+h*0.45, w*0.36, 4);
    ctx.fillStyle='#ffd24a';
    ctx.globalAlpha=0.55+0.25*Math.sin(G.t/18);
    ctx.fillRect(x+14, y+h*0.48, 14, 14);
    ctx.globalAlpha=1;
    ctx.strokeStyle='#3d2b1f'; ctx.lineWidth=2;
    ctx.strokeRect(x+14, y+h*0.48, 14, 14);
    ctx.fillStyle='#5c3d22';
    ctx.fillRect(x+w-28, y+22, 12, 22);
  }
  if(G.focus && G.focus.o===pr && !G.paused){
    focusGlow(x+4, y+8, w-8, h-8);
    drawPlate(x+w/2, y-6, 'ENTER \u00b7 or press E', '#ffd24a');
  } else if(Math.abs(G.p.x - pr.x) < 520){
    drawPlate(x+w/2, y-6, pr.label||'FAMILY COTTAGE', '#ffd24a');
  }
}
function drawFamilyFig(n, d, cam){
  // Visual scale-up while keeping the interaction hitbox (n.w/n.h) for gameplay
  const vs=ACTOR_SCALE;
  const w=n.w*vs, h=n.h*vs;
  const x=Math.round(n.x+n.w/2-w/2-cam);
  const y=Math.round(GROUND_Y-h);
  if(x<-100 || x>viewW()+100) return;
  const cx=x+w/2;
  if(G.focus && G.focus.o===n && !G.paused) focusGlow(x-6, y-8, w+12, h+10);
  if(!d){
    const q=Math.sin(G.t/15+n.x)*3;
    ctx.globalAlpha=0.6; ctx.fillStyle='#3a3152';
    ctx.fillRect(x+w*0.22, y+2, w*0.56, h*0.3);
    ctx.fillRect(x+w*0.06, y+h*0.32, w*0.88, h*0.42);
    ctx.fillRect(x, y+h*0.4, w*0.12, h*0.26);
    ctx.fillRect(x+w*0.88, y+h*0.4, w*0.12, h*0.26);
    ctx.fillRect(x+w*0.14, y+h*0.74, w*0.26, h*0.26);
    ctx.fillRect(x+w*0.6,  y+h*0.74, w*0.26, h*0.26);
    ctx.globalAlpha=1;
    ctx.fillStyle='#ffd24a'; ctx.font='bold 18px monospace'; ctx.textAlign='center';
    ctx.fillText('?', cx, y-10+q);
    drawPlate(cx, y-26+q, n.relation.toUpperCase(), '#ffd24a');
    ctx.fillStyle='#2a1408'; ctx.font='bold 10px monospace';
    ctx.fillText('+ tap to add', cx, GROUND_Y+16);
  } else {
    const bob = Math.sin(G.t/14+n.x)>0?1:0;
    const skin='#e0ac69';
    const hair = n.relation==='parent' ? '#cfcfd6' : '#241a12';
    const shirt = d.gender==='female' ? '#ff8ad8' : (d.gender==='other' ? '#3fbf8f' : '#5cc8ff');
    const shade2 = d.gender==='female' ? '#d4609f' : (d.gender==='other' ? '#2f9a70' : '#3f9ad4');
    const hw=w*0.6, hx=x+(w-hw)/2, hy=y+bob;
    ctx.fillStyle=skin; ctx.fillRect(hx, hy, hw, h*0.3);
    ctx.fillStyle=hair; ctx.fillRect(hx, hy, hw, 5);
    ctx.fillRect(hx, hy, 3, h*0.14); ctx.fillRect(hx+hw-3, hy, 3, h*0.14);
    if(d.gender==='female'){ ctx.fillRect(hx-3, hy+2, 3, h*0.26); ctx.fillRect(hx+hw, hy+2, 3, h*0.26); }
    ctx.fillStyle='#000';
    ctx.fillRect(hx+hw*0.22, hy+h*0.13, 3, 3); ctx.fillRect(hx+hw*0.62, hy+h*0.13, 3, 3);
    ctx.fillStyle='#8a4a3a'; ctx.fillRect(hx+hw*0.34, hy+h*0.23, hw*0.32, 2);
    const by=y+h*0.3+bob;
    ctx.fillStyle=shirt; ctx.fillRect(x+w*0.08, by, w*0.84, h*0.42);
    ctx.fillStyle=shade2; ctx.fillRect(x+w*0.08, by, w*0.84, 4);
    ctx.fillStyle=skin;
    ctx.fillRect(x, by+h*0.1, w*0.1, h*0.22);
    const wv=Math.sin(G.t/8+n.x)*5;
    ctx.fillStyle=shirt; ctx.fillRect(x+w*0.9, by-8+wv, w*0.12, h*0.2);
    ctx.fillStyle=skin;  ctx.fillRect(x+w*0.9, by-14+wv, w*0.12, 6);
    ctx.fillStyle='#2b2b3d';
    ctx.fillRect(x+w*0.16, y+h*0.72, w*0.26, h*0.24);
    ctx.fillRect(x+w*0.58, y+h*0.72, w*0.26, h*0.24);
    ctx.fillStyle='#101018';
    ctx.fillRect(x+w*0.14, y+h*0.93, w*0.3, h*0.07);
    ctx.fillRect(x+w*0.56, y+h*0.93, w*0.3, h*0.07);
    drawPlate(cx, y-14, '\u2713 '+d.name.slice(0,14).toUpperCase(), '#5fe08a');
    ctx.fillStyle='#a394c4'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
    ctx.fillText(n.relation.toUpperCase()+' \u00b7 tap to edit', cx, GROUND_Y+16);
  }
}
/** Predictable sequential front-idle frame (no random jumps). */
function frontIdleFrame(t, frameCount, delay=0, hold=10){
  const n=Math.max(1, frameCount|0);
  const tick=Math.max(0, (t|0) - (delay|0));
  return Math.floor(tick / Math.max(1, hold)) % n;
}

/** Keep the title lineup gently alive, with one brief gesture every 5.5 seconds. */
const TITLE_HERO_SLOT = 360; // ticks @ 60Hz ≈ 6s per character (≈5s readable bubble)
const TITLE_HERO_GESTURE_AT = 60; // gesture + bubble at 1s into their slot
const TITLE_CHAT_LINES = [
  { who:'Hey!', text:"This year’s benefits? They’re a quest." },
  { who:'Ready?', text:'Cover yourself & your family — then go for glory.' },
  { who:'Boast!', text:'Clear levels · grab the high score · own the Hall of Fame.' },
];
let _titleChatHero = -1;

function titleHeroLayout(){
  const cell=128;
  const pxScale=2.755;
  const dispW=cell*pxScale/RES, dispH=cell*pxScale/RES;
  const gap=dispW - 40;
  const stageCX=W*0.305;
  const stageY=H*0.72;
  const startX=stageCX - gap - dispW/2;
  const baseY=stageY - dispH + 10;
  return { dispW, dispH, gap, startX, baseY };
}

function titleHeroFrame(t, heroIdx, frameCount){
  const n=Math.max(1, frameCount|0);
  const idleCount=Math.min(4, n);
  const activeHero=Math.floor(t/TITLE_HERO_SLOT)%3;
  const slotTick=t%TITLE_HERO_SLOT;
  const gestureFrames=[4,5,6,5,4,7].filter(f=>f<n);
  if(heroIdx===activeHero && gestureFrames.length && slotTick>=TITLE_HERO_GESTURE_AT){
    const gestureStep=Math.floor((slotTick-TITLE_HERO_GESTURE_AT)/10);
    if(gestureStep<gestureFrames.length) return gestureFrames[gestureStep];
  }
  return frontIdleFrame(t, idleCount, heroIdx*7, 18);
}

/** Park the comic bubble above the gesturing hero; keep it up for the rest of their slot. */
function syncTitleChatBubble(t){
  const bubble=document.getElementById('titleChatBubble');
  const whoEl=document.getElementById('titleBubbleWho');
  const textEl=document.getElementById('titleBubbleText');
  if(!bubble || !whoEl || !textEl) return;

  const activeHero=Math.floor(t/TITLE_HERO_SLOT)%3;
  const slotTick=t%TITLE_HERO_SLOT;
  const show=slotTick>=TITLE_HERO_GESTURE_AT;

  if(show && activeHero!==_titleChatHero){
    _titleChatHero=activeHero;
    const line=TITLE_CHAT_LINES[activeHero%TITLE_CHAT_LINES.length];
    whoEl.textContent=line.who;
    textEl.textContent=line.text;
  }
  if(!show) _titleChatHero=-1;

  const lay=titleHeroLayout();
  const cx=lay.startX + activeHero*lay.gap + lay.dispW/2;
  // Anchor near the crown of the sprite — CSS lifts the whole bubble (+ tail) above it
  const anchorY=lay.baseY + lay.dispH*0.02;
  const leftPct=Math.max(16, Math.min(78, cx/W*100));
  const topPct=Math.max(18, Math.min(52, anchorY/H*100));
  bubble.style.left=leftPct.toFixed(2)+'%';
  bubble.style.top=topPct.toFixed(2)+'%';
  bubble.hidden=false;
  bubble.classList.toggle('is-on', show);
  bubble.setAttribute('aria-hidden', show?'false':'true');
}

function renderTitleScene(){
  const t=G.t;
  // Static scenic BG already blitted by render(). Only light birds + heroes move.
  const afBird=Math.floor(t/10)%5;
  Sprites.draw(ctx,'bird',afBird, (t*0.55)%(W+80)-40, 90+Math.sin(t/40)*8, 1.2);
  Sprites.draw(ctx,'bird',afBird, (t*0.4+500)%(W+80)-40, 140+Math.sin(t/33+2)*7, 1.0);

  // Three gender heroes, centered as a compact group on the circular grass stage.
  const lineup=[
    { key:'male' },
    { key:'female' },
    { key:'other' },
  ];
  const lay=titleHeroLayout();
  lineup.forEach((item,i)=>{
    const frames=(Sprites.showcaseTitle && Sprites.showcaseTitle[item.key])
      || (Sprites.showcase && Sprites.showcase[item.key])
      || null;
    if(!frames || !frames.length) return;
    const af=titleHeroFrame(t, i, frames.length);
    const fr=frames[af];
    const x=lay.startX + i*lay.gap;
    ctx.save();
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(fr, 0,0,fr.width,fr.height, x, lay.baseY, lay.dispW, lay.dispH);
    ctx.restore();
  });
  syncTitleChatBubble(t);
}

/* Fixed-timestep loop: the simulation always advances at 60 steps/sec no
   matter the display refresh rate. Slow machines drop frames but keep
   correct game speed; 120Hz+ monitors don't run the game at double speed. */
let _last=performance.now(), _acc=0;
const STEP=1000/60, MAX_STEPS=4;
function loop(now){
  requestAnimationFrame(loop);
  if(now===undefined) now=performance.now();
  let dt=now-_last; _last=now;
  if(dt>250) dt=250;            // returning from a background tab
  _acc+=dt;
  let steps=0;
  while(_acc>=STEP && steps<MAX_STEPS){
    if(G.state==='play') update();
    if(G.state==='title') G.t++;
    _acc-=STEP; steps++;
  }
  if(_acc>=STEP) _acc=0;        // can't keep up — drop backlog, never spiral
  // Don't blit the play canvas under Focus Zone overlays (ghosts through transparent sprites).
  // Never skip title — overlays must not leave the home screen stuck on a blank frame.
  if(G.state==='play' && (isFocusZoneOpen() || isPlanChooserOpen() || isAddonBazaarOpen())) return;
  if(G.state==='play'||G.state==='title') render();
}

/* ---------- HUD / toast ---------- */
function isPauseMenuOpen(){
  const el=document.getElementById('pauseUI');
  return !!(el && !el.hidden);
}
function isBlockingOverlayOpen(){
  return !!(G.enemyIntro || G.levelResults
    || isFocusZoneOpen() || isPlanChooserOpen() || isAddonBazaarOpen()
    || (modalLayer && modalLayer.style.display==='flex'));
}
function canOpenPauseMenu(){
  return G.state==='play' && !G.paused && !isPauseMenuOpen() && !isBlockingOverlayOpen();
}
function openPauseMenu(){
  if(!canOpenPauseMenu()) return;
  Input.l=Input.r=Input.jump=Input.throw=false;
  G.paused=true;
  const el=document.getElementById('pauseUI');
  if(el) el.hidden=false;
  playSfx('desk');
  const resume=document.getElementById('pauseResumeBtn');
  if(resume) setTimeout(()=>resume.focus(), 40);
}
function closePauseMenuUI(){
  const el=document.getElementById('pauseUI');
  if(el) el.hidden=true;
}
function resumeGame(){
  if(!isPauseMenuOpen()) return;
  closePauseMenuUI();
  G.paused=false;
  playSfx('confirm');
}
function exitPauseToTitle(){
  if(!isPauseMenuOpen()) return;
  closePauseMenuUI();
  playSfx('confirm');
  showTitle();
}
function canOpenFocusFromHud(){
  return G.state==='play' && !G.paused && !G.enemyIntro && !G.levelResults
    && !isFocusZoneOpen() && !isPlanChooserOpen() && !isAddonBazaarOpen();
}
function updateFocusChips(){
  const show = G.state==='play' && !G.levelResults;
  const set = (id, on)=>{
    const el=document.getElementById(id);
    if(!el) return;
    el.hidden = !(show && on);
  };
  set('fzFamily', !!G.done.family);
  set('fzGmc', !!G.done.gmc);
  set('fzAddon', !!G.done.addon);
  set('fzGtl', !!G.done.gtl && !!CONFIG.enableLevel4 && CONFIG.gtlPlans.length>0);
  set('fzSuperTopUp', !!G.done.superTopUp && (CONFIG.superTopUpPlans||[]).length>0);
}
function openFocusFromHud(kind){
  if(!canOpenFocusFromHud()) return;
  if(kind==='family') openFamilyFocusZone({revisit:true});
  else if(kind==='gmc') openGmcFocusZone(null, {revisit:true});
  else if(kind==='addon') openAddonBazaarFocusZone({revisit:true});
  else if(kind==='gtl') openGTL({revisit:true});
  else if(kind==='superTopUp') openSuperTopUp({revisit:true});
}

function updateHUD(){
  const heartsEl=document.getElementById('hearts');
  if(heartsEl){
    const h=Math.max(0, Math.min(3, G.p.hearts|0));
    let html='';
    for(let i=0;i<3;i++){
      html+='<i class="px-heart '+(i<h?'on':'off')+'" aria-hidden="true"></i>';
    }
    heartsEl.innerHTML=html;
    heartsEl.setAttribute('aria-label', h+(h===1?' life':' lives'));
  }
  const coinEl=document.getElementById('coinHud');
  if(coinEl) coinEl.innerHTML='<span class="hudIco" aria-hidden="true">◉</span> <b>'+G.coinsGot+'</b>';
  const premEl=document.getElementById('premHud');
  if(premEl){
    const picks=[];
    if(Enrol.dependants.length) picks.push(Enrol.dependants.length+' family');
    if(Enrol.gmc) picks.push(Enrol.gmc.planName||'Medical');
    if(Enrol.addons.length) picks.push(Enrol.addons.length+' add-on'+(Enrol.addons.length>1?'s':''));
    if(Enrol.gtl) picks.push('Term life');
    if(Enrol.superTopUp) picks.push('Super Top-Up');
    if(Enrol.nominees.length) picks.push(Enrol.nominees.length+' nominee'+(Enrol.nominees.length>1?'s':''));
    premEl.textContent = picks.length ? picks.join(' · ') : 'Your picks';
  }
  updateFocusChips();
}
let toastTimer=null;
function toast(msg, ms=2600){
  const t=document.getElementById('toast');
  t.textContent=msg; t.style.display='block';
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.style.display='none', ms);
}
const eiDismissBtn=document.getElementById('eiDismiss');
if(eiDismissBtn) eiDismissBtn.onclick=()=>dismissEnemyIntro();
document.getElementById('pauseResumeBtn')?.addEventListener('click', ()=>resumeGame());
document.getElementById('pauseTitleBtn')?.addEventListener('click', ()=>exitPauseToTitle());
document.getElementById('fzFamily')?.addEventListener('click', ()=>openFocusFromHud('family'));
document.getElementById('fzGmc')?.addEventListener('click', ()=>openFocusFromHud('gmc'));
document.getElementById('fzAddon')?.addEventListener('click', ()=>openFocusFromHud('addon'));
document.getElementById('fzGtl')?.addEventListener('click', ()=>openFocusFromHud('gtl'));
document.getElementById('fzSuperTopUp')?.addEventListener('click', ()=>openFocusFromHud('superTopUp'));
document.getElementById('tasksBtn').onclick=()=>{
  if(G.enemyIntro) return;
  if(G.state!=='play'||G.paused) return;
  const L=LEVELS[G.levelIdx];
  const ids=[...new Set([
    ...(L.stations.map(s=>s.task)),
    ...(L.required||[]),
    ...((L.portals||[]).map(p=>'portal_'+p.kind)),
  ])];
  const isDone=id=> id==='family' || id==='portal_family' ? !!G.done.family
    : id==='gmc' || id==='portal_gmc' ? !!G.done.gmc
    : id==='addon' || id==='portal_addon' ? !!G.done.addon
    : id.startsWith('gmc_si_') ? !!(Enrol.gmc&&Enrol.gmc.si===+id.slice(7))
    : !!G.done[id];
  let html='';
  for(const id of ids){
    const req=(L.required||[]).includes(id) || id==='portal_family' || id==='family'
      || id==='portal_gmc' || id==='gmc';
    html+='<div class="checkline '+(isDone(id)?'sel':'')+'">'+
      (isDone(id)?'<span class="ok">✓</span>':'<span class="no">•</span>')+
      ' '+taskLabel(id)+(req?' <span class="tag">required</span>':' <span class="tag">optional</span>')+'</div>';
  }
  if(L.gate) html+='<p class="muted" style="margin-top:10px;">Reach the flag to confirm your choices for this level.</p>';
  if((L.portals||[]).some(p=>p.kind==='family')) html+='<p class="muted" style="margin-top:10px;">Enter the cottage to manage your family party and clear the level.</p>';
  if((L.portals||[]).some(p=>p.kind==='gmc')) html+='<p class="muted" style="margin-top:10px;">Enter the clinic to compare medical plans and clear the level.</p>';
  if((L.portals||[]).some(p=>p.kind==='addon')) html+='<p class="muted" style="margin-top:10px;">Enter the bazaar pavilion to pick optional add-ons and clear the level.</p>';
  openModal({title:LEVELS[G.levelIdx].name, sub:'Go near the entrance or a board \u2014 it lights up \u2014 then tap it or press E.', body:html,
    buttons:[{label:'Close', cls:'primary', fn:close=>close()}]});
};



/*═══════════════════════════════════════════════════════════════════
  7) MODALS & ENROLMENT TASKS
═══════════════════════════════════════════════════════════════════*/
const modalLayer=document.getElementById('modalLayer');
function openModal({title, sub, body, buttons}){
  G.paused=true; Input.l=Input.r=Input.jump=false;
  const m=document.createElement('div'); m.className='modal';
  m.innerHTML='<h2>'+title+'</h2>'+(sub?'<div class="sub">'+sub+'</div>':'')+
    '<div class="bd">'+body+'</div><div class="btnrow"></div>';
  const row=m.querySelector('.btnrow');
  const close=()=>{ modalLayer.style.display='none'; modalLayer.innerHTML=''; G.paused=false; };
  for(const b of (buttons||[])){
    const el=document.createElement('button');
    el.className='pxbtn '+(b.cls||''); el.textContent=b.label;
    el.onclick=()=>b.fn(close, m);
    row.appendChild(el);
  }
  modalLayer.innerHTML=''; modalLayer.appendChild(m); modalLayer.style.display='flex';
  setTimeout(()=>{ const f=m.querySelector('input[type=text],input[type=number],select');
    if(f){ f.focus(); if(f.select) f.select(); } }, 60);
  return m;
}
function pickCards(m, sel){ // single-select cards inside a modal
  m.querySelectorAll(sel).forEach(c=>c.onclick=()=>{
    m.querySelectorAll(sel).forEach(o=>o.classList.remove('sel'));
    c.classList.add('sel');
    m.dispatchEvent(new CustomEvent('cardpick',{detail:c}));
  });
}

function taskLabel(id){
  const map={name:'Choose your name', gender:'Choose gender', age:'Set your age',
    marital:'Marital status',
    dep_spouse:'Add spouse', dep_child1:'Add child', dep_child2:'Add second child', dep_child3:'Add third child',
    dep_parent1:'Add parent', dep_parent2:'Add second parent',
    gmc:'Pick medical cover', gtl:'Pick term life cover', nominees:'Add nominees',
    family:'Family Focus Zone', portal_family:'Enter family cottage',
    portal_gmc:'Enter medical clinic',
    portal_addon:'Enter wellbeing bazaar',
    coverConfirm:'Choose who to cover', addonConfirm:'Review add-ons'};
  if(id.startsWith('addon_')){
    const a=CONFIG.addons.find(a=>'addon_'+a.id===id); return a?a.name:id;
  }
  if(id.startsWith('gmc_si_')) return 'Medical cover '+siShort(+id.slice(7));
  return map[id]||id;
}

/* ---------- TASK DISPATCH (setup now happens on the Character Creator screen) ---------- */
function openTask(id){
  if(id.startsWith('dep_')) return openDependant(id);
  if(id.startsWith('addon_')) return openAddon(id.slice(6));
  if(id.startsWith('gmc_si_')) return openGMC(+id.slice(7));
  if(id==='gmc') return openGMCAll();
  if(id==='gtl') return openGTL();
  if(id==='nominees') return openNominees();
}

function openPortal(pr){
  if(isFocusZoneOpen() || isPlanChooserOpen() || isAddonBazaarOpen()) return;
  if(pr.kind==='family') openFamilyFocusZone();
  else if(pr.kind==='gmc') openGmcFocusZone();
  else if(pr.kind==='addon') openAddonBazaarFocusZone();
  else toast('This entrance is not ready yet.');
}

function familySlotDefs(){
  const S=CONFIG.dependantStructure;
  const slots=[{slot:'self', relation:'self', label:'Self'}];
  // Hide spouse slot unless marital status is married (avoids dead-end error toast).
  if(Enrol.character.marital==='married'){
    for(let i=1;i<=S.spouse;i++) slots.push({slot:'dep_spouse', relation:'spouse', label:'Spouse'});
  }
  for(let i=1;i<=S.child;i++) slots.push({slot:'dep_child'+i, relation:'child', label:'Child '+i});
  for(let i=1;i<=S.parent;i++) slots.push({slot:'dep_parent'+i, relation:'parent', label:'Parent '+i});
  return slots;
}

function buildFamilyFocusSlots(){
  return familySlotDefs().map(def=>{
    if(def.relation==='self'){
      return {
        slot:'self', relation:'self', label:def.label, locked:true, empty:false,
        memberId:'self',
        name:Enrol.character.name||'You',
        age:Enrol.character.age||'',
        gender:Enrol.character.gender||'',
        covered:true,
      };
    }
    const d=Enrol.dependants.find(x=>x.slot===def.slot);
    if(!d){
      return {
        slot:def.slot, relation:def.relation, label:def.label,
        memberId:null, name:'', age:'', gender:'', covered:false, empty:true,
      };
    }
    return {
      slot:def.slot, relation:def.relation, label:def.label, empty:false,
      memberId:d.id, name:d.name, age:d.age, gender:d.gender,
      covered:Enrol.covered.includes(d.id),
    };
  });
}

function saveFamilyFocusSlot(slot, data){
  const relation = slot.includes('spouse')?'spouse' : slot.includes('child')?'child':'parent';
  const S=CONFIG.dependantStructure;
  if(relation==='spouse' && Enrol.character.marital!=='married'){
    return 'Spouse needs marital status = married.';
  }
  const name=(data.name||'').trim();
  if(!name) return 'Name needed';
  // Name-only for now — fill sensible defaults for later levels / cover rules
  const existing=Enrol.dependants.find(d=>d.slot===slot);
  let age = data.age;
  if(age===undefined || age===null || age==='' || isNaN(+age)){
    age = existing?.age ?? (relation==='child' ? 10 : relation==='parent' ? 55 : 30);
  } else age = +age;
  let gender = (data.gender||'').trim();
  if(!gender){
    gender = existing?.gender || (
      relation==='spouse'
        ? (Enrol.character.gender==='male'?'female': Enrol.character.gender==='female'?'male':'other')
        : (Enrol.character.gender||'other')
    );
  }
  const count=Enrol.dependants.filter(d=>d.relation===relation).length;
  if(!existing && count>=S[relation]) return 'Policy allows up to '+S[relation]+' '+relation+'(s)';
  if(existing) Object.assign(existing,{name,age,gender});
  else Enrol.dependants.push({id:'d'+(depSeq++), slot, relation, name, age, gender});
  return null;
}

function clearFamilyFocusSlot(slot){
  Enrol.dependants=Enrol.dependants.filter(d=>d.slot!==slot);
  Enrol.covered=Enrol.covered.filter(id=>id==='self' || Enrol.dependants.some(d=>d.id===id));
}

/** Paint Focus Zone / party backdrop from the sprite engine (same plates as the level). */
function paintPartyBackground(canvas){
  const key = (LEVELS[G.levelIdx|0] && LEVELS[G.levelIdx|0].bg) || 'bg_l1';
  const fr = Sprites.frames[key];
  const x = canvas.getContext('2d');
  if(!x) return;
  x.imageSmoothingEnabled=false;
  x.clearRect(0,0,canvas.width,canvas.height);
  const src = fr && fr[0];
  if(!src){
    // Engine default art should still exist via buildDefault — last-ditch fill
    x.fillStyle='#6ec8f0';
    x.fillRect(0,0,canvas.width,canvas.height);
    return;
  }
  // Cover the focus zone (like object-fit: cover)
  const sw=src.width, sh=src.height;
  const scale=Math.max(canvas.width/sw, canvas.height/sh);
  const dw=sw*scale, dh=sh*scale;
  const dx=(canvas.width-dw)/2, dy=(canvas.height-dh)/2;
  x.drawImage(src, 0,0,sw,sh, dx,dy,dw,dh);
  // Soft vignette so UI text stays readable
  const g=x.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0,'rgba(16,16,24,.25)');
  g.addColorStop(0.45,'rgba(16,16,24,.05)');
  g.addColorStop(0.72,'rgba(16,16,24,.15)');
  g.addColorStop(1,'rgba(16,16,24,.55)');
  x.fillStyle=g;
  x.fillRect(0,0,canvas.width,canvas.height);
}

/** Paint Focus Zone stage strip using the same terrain tiles as the level. */
function paintPartyGround(canvas){
  const x=canvas.getContext('2d');
  if(!x) return;
  x.imageSmoothingEnabled=false;
  x.clearRect(0,0,canvas.width,canvas.height);
  const top=Sprites.frames.tile_top && Sprites.frames.tile_top[0];
  const dirt=Sprites.frames.tile_ground && Sprites.frames.tile_ground[0];
  // Match in-level blit size (logical TILE), not half-canvas squash.
  const ts = TILE;
  const rows = Math.max(2, Math.ceil(canvas.height / ts));
  for(let row=0; row<rows; row++){
    const src = row===0 ? top : dirt;
    const y = row * ts;
    const h = Math.min(ts, canvas.height - y);
    for(let px=0; px<canvas.width; px+=ts){
      if(src && src.width){
        x.drawImage(src, 0,0,src.width,src.height, px,y,ts,h);
      } else {
        x.fillStyle = row===0 ? '#5fae4a' : '#7a4b2c';
        x.fillRect(px,y,ts,h);
      }
    }
  }
}

/** Paint a party-line figure into a Focus Zone canvas (empty silhouette or filled sprite). */
function paintPartyMember(canvas, slot, frame){
  const c=canvas.getContext('2d');
  c.imageSmoothingEnabled=false;
  c.setTransform(1,0,0,1,0,0);
  c.globalAlpha=1;
  c.globalCompositeOperation='source-over';
  c.setLineDash([]);
  c.clearRect(0,0,canvas.width,canvas.height);

  // Draw in 64×64 logical space, scaled up to the canvas (128×128)
  const sc = Math.min(canvas.width||128, canvas.height||128) / 64;
  c.save();
  c.scale(sc, sc);

  // Soft shadow follows the intended relation scale.
  const relScale=slot.empty ? 1 : familyFrontScale(slot);
  const shadowW=36*relScale;
  c.fillStyle='rgba(8,4,16,.55)';
  c.fillRect(32-shadowW/2, 56, shadowW, 4);

  if(slot.empty){
    drawPartySilhouette(c, slot.relation, frame);
  } else if(slot.relation==='self'){
    // Gender-pack Focus Zone front only — never stack procedural under authored.
    const pack = Sprites.activeGenderPack && Sprites.activeGenderPack();
    const strip =
      (pack && pack.focus_hero && pack.focus_hero.length && pack.focus_hero) ||
      (Sprites.frames.focus_hero && Sprites.frames.focus_hero.length && Sprites.frames.focus_hero) ||
      (Sprites.frames.hero_front && Sprites.frames.hero_front.length && Sprites.frames.hero_front) ||
      null;
    const src = strip ? strip[frame % strip.length] : null;
    if(src && src.width){
      c.drawImage(src, 0,0,src.width,src.height, 0,0,64,64);
    } else {
      c.save();
      c.translate(8, 8);
      drawHeroFront(c, frame);
      c.restore();
    }
  } else {
    // Prefer relation+gender family pack; procedural fallback.
    const strip = Sprites.familyFramesFor(slot.relation, slot.gender);
    const src = strip && strip.length ? strip[frame % strip.length] : null;
    if(src && src.width){
      const size=64*relScale;
      const dx=(64-size)/2;
      const dy=64-size; // keep feet aligned while reducing the figure
      try{ c.drawImage(src, 0,0,src.width,src.height, dx,dy,size,size); }
      catch(_){
        c.save();
        c.translate(32,64); c.scale(relScale,relScale); c.translate(-32,-64);
        drawPartyPerson(c, slot, frame);
        c.restore();
      }
    } else {
      c.save();
      c.translate(32,64); c.scale(relScale,relScale); c.translate(-32,-64);
      drawPartyPerson(c, slot, frame);
      c.restore();
    }
  }

  c.restore();
}

function drawPartySilhouette(x, relation, f){
  const bob=[0,0,1,1,0][f%5];
  const child = relation==='child';
  const y0 = child ? 10 : 2;
  const pulse = 0.55 + 0.35*((Math.sin(f*1.2)+1)/2);

  // Hollow body — dashed gold “ghost” inviting a join
  x.save();
  x.globalAlpha=pulse;
  x.strokeStyle='#ffd24a';
  x.fillStyle='rgba(58,49,82,.55)';
  x.lineWidth=2;
  x.setLineDash([3,2]);

  const headW = child ? 14 : 18;
  const headH = child ? 12 : 14;
  const bodyH = child ? 16 : 20;
  const legH = child ? 12 : 14;

  // head
  x.fillRect(32-headW/2, y0+4+bob, headW, headH);
  x.strokeRect(32-headW/2, y0+4+bob, headW, headH);
  // torso
  x.fillRect(18, y0+18+bob, 28, bodyH);
  x.strokeRect(18, y0+18+bob, 28, bodyH);
  // legs
  x.fillRect(20, y0+18+bodyH+bob, 8, legH);
  x.fillRect(36, y0+18+bodyH+bob, 8, legH);
  x.strokeRect(20, y0+18+bodyH+bob, 8, legH);
  x.strokeRect(36, y0+18+bodyH+bob, 8, legH);
  x.restore();
}

function drawPartyPerson(x, slot, f){
  const skin = SKINS[(Enrol.character.skin ?? 2)];
  const hair = HAIRS[(Enrol.character.skin ?? 2)] || '#241a12';
  const g = slot.gender || 'other';
  const bob=[0,0,1,1,0][f%5];
  const arm=[0,0,1,0,0][f%5];
  const child = slot.relation==='child';
  const parent = slot.relation==='parent';
  const spouse = slot.relation==='spouse';

  // Role colours — chunky, readable, ART_BIBLE-adjacent
  let shirt = '#4a6cd4';
  if(spouse) shirt = g==='male' ? '#5c3f8a' : '#e0559a';
  if(child) shirt = '#3fc9c0';
  if(parent) shirt = '#c4744f';
  if(g==='other' && !child && !parent) shirt = '#3fbf8f';

  const y0 = child ? 8 : 0;
  const headW = child ? 20 : 24;
  const headH = child ? 16 : 18;
  const torsoH = child ? 16 : 20;
  const legH = child ? 12 : 14;

  // legs (front-facing columns)
  px(x,'#2b2b3d', 20, y0+36+bob, 9, legH);
  px(x,'#2b2b3d', 35, y0+36+bob, 9, legH);
  px(x,'#1a1a26', 19, y0+36+legH+bob, 11, 3);
  px(x,'#1a1a26', 34, y0+36+legH+bob, 11, 3);
  // torso
  px(x,shirt, 18, y0+18+bob, 28, torsoH);
  px(x,'#101018', 31, y0+18+bob, 2, torsoH);
  // arms
  px(x,shirt, 11, y0+20+bob+arm, 7, 14);
  px(x,shirt, 46, y0+20+bob-arm, 7, 14);
  px(x,skin, 11, y0+33+bob+arm, 7, 4);
  px(x,skin, 46, y0+33+bob-arm, 7, 4);
  // head
  px(x,skin, 32-headW/2, y0+2+bob, headW, headH);
  // hair
  const hairCol = parent ? '#8a8498' : hair;
  px(x,hairCol, 32-headW/2-1, y0+bob, headW+2, 6);
  if(g==='female'){
    px(x,hairCol, 32-headW/2-3, y0+5+bob, 5, 14);
    px(x,hairCol, 32+headW/2-2, y0+5+bob, 5, 14);
  }
  if(parent){ px(x,'#c8c2d8', 24, y0+1+bob, 16, 3); }
  // face toward camera
  px(x,'#ffffff', 24, y0+8+bob, 6, 6);
  px(x,'#ffffff', 34, y0+8+bob, 6, 6);
  px(x,'#101018', 26, y0+10+bob, 2, 2);
  px(x,'#101018', 36, y0+10+bob, 2, 2);
  px(x,'#c68642', 31, y0+13+bob, 2, 2);
  px(x,'#8d3b3b', 28, y0+16+bob, 8, 2);
}

/** Family focus hides #game; restore after close / demo jumps / title. */
function restoreGameCanvas(){
  const gameCv=document.getElementById('game');
  if(gameCv) gameCv.style.visibility='visible';
}

function openFamilyFocusZone(opts={}){
  const revisit = !!opts.revisit;
  playSfx('desk');
  G.paused=true;
  window.G=G;
  window.toast=toast;
  // Ensure self uses gender-pack front (not stale procedural from boot).
  try{ Sprites.rebuildHero(); }catch(_){}
  const gameCv=document.getElementById('game');
  if(gameCv) gameCv.style.visibility='hidden';
  const S=CONFIG.dependantStructure;
  const spouseNote = Enrol.character.marital==='married'
    ? (S.spouse+' spouse, ')
    : '';
  openFocusZone({
    companyName:CONFIG.COMPANY,
    logoUrl:CONFIG.LOGO_URL,
    logoFallbackUrl:CONFIG.LOGO_FALLBACK_URL,
    title: revisit ? 'Edit your party' : 'Build your party',
    structureNote:'Add up to '+spouseNote+S.child+' children, '+S.parent+' parents. Tap + to recruit — name + look. C = covered.',
    maritalStatus:Enrol.character.marital||'',
    bgSpriteKey:'bg_l1',
    getSlots:buildFamilyFocusSlots,
    paintMember:paintPartyMember,
    paintBackground:paintPartyBackground,
    paintGround:paintPartyGround,
    onSaveSlot:saveFamilyFocusSlot,
    onClearSlot:clearFamilyFocusSlot,
    onClose:()=>{
      closeFocusZone();
      G.paused=false;
      restoreGameCanvas();
      for(const pr of (G.portals||[])) pr.entered=false;
      updateFocusChips();
    },
    onConfirm:(coveredIds)=>{
      Enrol.covered=coveredIds.includes('self')?coveredIds:['self',...coveredIds];
      G.done.family=true;
      G.done.coverConfirm=true;
      closeFocusZone();
      restoreGameCanvas();
      updateHUD();
      if(revisit){
        G.paused=false;
        for(const pr of (G.portals||[])) pr.entered=false;
        toast('Party updated!');
        return;
      }
      toast('Party ready — on to the next level!');
      completeLevel();
    },
  });
}

/* ---------- LEVEL 1: dependants (legacy modal path kept for compatibility) ---------- */
function openDependant(id){
  const relation = id.includes('spouse')?'spouse' : id.includes('child')?'child':'parent';
  const S=CONFIG.dependantStructure;
  const existing = Enrol.dependants.find(d=>d.slot===id);

  if(relation==='spouse' && Enrol.character.marital!=='married' && !existing){
    return openModal({title:'Add Spouse', sub:'Eligibility check',
      body:'<p>Your marital status is <b>'+(Enrol.character.marital||'not set')+'</b>, so a spouse can\u2019t be added under this policy\u2019s dependant structure.</p><p class="muted" style="margin-top:8px;">Picked the wrong status while creating your hero? Fix it right here.</p>',
      buttons:[
        {label:'Change to married',fn:c=>{ Enrol.character.marital='married'; Sprites.rebuildHero();
          c(); toast('Status updated (ring on!) \u2014 tap your spouse to add them'); }},
        {label:'Got it',cls:'primary',fn:c=>{G.done[id]=true; c();}}]});
  }
  const count = Enrol.dependants.filter(d=>d.relation===relation).length;
  if(!existing && count >= S[relation]){
    return openModal({title:taskLabel(id), body:'<p>Your policy allows up to <b>'+S[relation]+'</b> '+relation+'(s) — you\u2019ve reached the limit.</p>',
      buttons:[{label:'OK',cls:'primary',fn:c=>{G.done[id]=true;c();}}]});
  }
  const d=existing||{name:'',age:'',gender:relation==='spouse'?(Enrol.character.gender==='male'?'female':'male'):''};
  const genderSel='<select id="d_gender"><option value="">— pick —</option>'+
    ['male','female','other'].map(v=>'<option value="'+v+'"'+(d.gender===v?' selected':'')+'>'+v+'</option>').join('')+'</select>';
  const m=openModal({title:taskLabel(id),
    sub:'Policy allows: '+S.spouse+' spouse · '+S.child+' children · '+S.parent+' parents. Adding here is optional — you\u2019ll pick who to actually cover at the flag.',
    body:'<div class="row"><label>Name</label><input type="text" id="d_name" value="'+(d.name||'')+'"></div>'+
      '<div class="row"><label>Age</label><input type="number" id="d_age" min="0" max="99" value="'+(d.age||'')+'"></div>'+
      '<div class="row"><label>Gender</label>'+genderSel+'</div>',
    buttons:[
      {label:'Skip',fn:c=>{G.done[id]=true;c();}},
      {label:existing?'Update':'Add to family',cls:'good',fn:(c,m)=>{
        const name=m.querySelector('#d_name').value.trim();
        const age=parseInt(m.querySelector('#d_age').value,10);
        const gender=m.querySelector('#d_gender').value;
        if(!name) return toast('Name needed');
        if(isNaN(age)||age<0||age>99) return toast('Valid age needed');
        if(relation==='child'&&age>25) return toast('Children can be covered up to age 25 in this policy');
        if(relation==='parent'&&age<40) return toast('That seems young for a parent — check the age');
        if(!gender) return toast('Pick a gender');
        if(existing){ Object.assign(existing,{name,age,gender}); }
        else Enrol.dependants.push({id:'d'+(depSeq++), slot:id, relation, name, age, gender});
        G.done[id]=true; c(); toast(name+' joined your party! ★');
      }}]});
}

function openGate(gate){
  if(gate==='coverConfirm'){
    const mem=allMembers();
    if(!Enrol.covered.includes('self')) Enrol.covered=['self',...Enrol.dependants.map(d=>d.id)];
    const m=openModal({title:'Who do you want to cover?',
      sub:'These members will be covered under your medical policy. You are always covered.',
      body: mem.map(x=>'<div class="checkline '+(Enrol.covered.includes(x.id)?'sel':'')+(x.id==='self'?' dis':'')+'">'+
        '<input type="checkbox" data-id="'+x.id+'" '+(Enrol.covered.includes(x.id)?'checked':'')+(x.id==='self'?' disabled':'')+'>'+
        '<span><b>'+x.name+'</b> <span class="muted">· '+x.relation+' · '+x.age+' · '+(x.gender||'—')+'</span></span></div>').join('')+
        (Enrol.dependants.length===0?'<p class="muted" style="margin-top:8px;">No dependants added — you can go back to the E blocks to add family, or continue solo.</p>':''),
      buttons:[
        {label:'Back to level',fn:c=>c()},
        {label:'Confirm & clear level',cls:'good',fn:(c,m)=>{
          const ids=['self'];
          m.querySelectorAll('input[type=checkbox]').forEach(cb=>{ if(cb.checked&&cb.dataset.id!=='self') ids.push(cb.dataset.id); });
          Enrol.covered=ids; G.done.coverConfirm=true; c(); completeLevel();
        }}]});
    m.querySelectorAll('.checkline:not(.dis)').forEach(l=>{
      const cb=l.querySelector('input');
      l.onclick=e=>{ if(e.target!==cb){cb.checked=!cb.checked;} l.classList.toggle('sel',cb.checked); };
    });
  }
  if(gate==='addonConfirm'){
    const list=Enrol.addons.length
      ? Enrol.addons.map(a=>'<div class="optcard sel"><span class="t">'+a.name+'</span><div class="d">'+
          (a.per==='family'?'Whole family':a.memberNames.join(', '))+'</div></div>').join('')
      : '<p class="muted">No add-ons selected. That\u2019s okay — they\u2019re optional power-ups!</p>';
    openModal({title:'Review your add-ons', sub:'You can still go back to any E block to change these.',
      body:list+(Enrol.addons.length?'<p class="muted" style="margin-top:10px;">'+Enrol.addons.length+' add-on'+(Enrol.addons.length>1?'s':'')+' selected.</p>':''),
      buttons:[
        {label:'Back to level',fn:c=>c()},
        {label:'Confirm & clear level',cls:'good',fn:c=>{G.done.addonConfirm=true; c(); completeLevel();}}]});
  }
}

/* ---------- LEVEL 2: GMC ----------
   Each block in the level is one sum-insured amount. Jumping into it opens
   the policies available at that amount; you can also browse everything. */
function plansAtSI(si){
  const out=[];
  for(const p of CONFIG.gmcPlans){
    const t=p.sums.find(x=>x.si===si);
    if(t) out.push({plan:p, tier:t});
  }
  return out;
}

function fmtPrem(n){ return n===0 ? 'FREE (company paid)' : fmtINR(n)+'/yr'; }

function planTone(id){
  if(id.includes('base')) return 'base';
  if(id.includes('gold')) return 'gold';
  if(id.includes('diamond')) return 'diamond';
  return 'default';
}

function paintLevelBackground(canvas){
  paintPartyBackground(canvas);
}

/** L2 Focus Zone — Base / Gold / Diamond side-by-side (no multi-step desk). */
function openGmcFocusZone(filterSi, opts={}){
  const revisit = !!opts.revisit;
  playSfx('desk');
  const covered = coveredMembers().map(m=>m.name).join(', ') || 'you';
  const familyLine = (()=>{
    const S=CONFIG.dependantStructure;
    return 'Family: Self + up to '+S.spouse+' spouse, '+S.child+' children, '+S.parent+' parents';
  })();
  const plans = [];
  const tagById = new Map();
  for(const p of CONFIG.gmcPlans){
    for(const t of p.sums){
      if(filterSi!=null && t.si!==filterSi) continue;
      const id = p.id+'__'+t.si;
      plans.push({
        id,
        name: p.name,
        coverNote: p.coverNote || familyLine,
        sumLabel: fmtINR(t.si)+' sum insured',
        priceLabel: t.prem===0 ? '₹ 0 / family / year' : fmtINR(t.prem)+' / family / year',
        priceSub: t.emi ? ('or 3 salary EMIs · '+fmtINR(t.emi)+'/mo') : undefined,
        badge: undefined,
        badgeTone: undefined,
        highlights: (p.features||[]).slice(0,2).map(f=>f.label+': '+f.value),
        tone: planTone(p.id),
        _planId: p.id,
        _si: t.si,
        _prem: t.prem,
        _planName: p.name,
      });
    }
  }
  if(!plans.length){ toast('No medical plans available for this cover.'); return; }
  const sponsored = plans.find((x)=>Number(x._prem)===0);
  if(sponsored) tagById.set(sponsored.id, { badge:'Company sponsored', badgeTone:'sponsored' });
  const fallbackBestValue = [...plans]
    .filter((x)=>Number(x._prem)>0)
    .sort((a,b)=> (Number(a._prem)||0) - (Number(b._prem)||0) || (Number(b._si)||0) - (Number(a._si)||0))[0];
  const preferredBestValue = [...plans].find((x)=>String(x._planId||'').toLowerCase().includes('silver'))
    || [...plans].find((x)=>String(x._planId||'').toLowerCase().includes('gold'));
  const bestValue = preferredBestValue && Number(preferredBestValue._prem)>0
    ? preferredBestValue
    : fallbackBestValue;
  if(bestValue && !tagById.has(bestValue.id)) tagById.set(bestValue.id, { badge:'Best value', badgeTone:'value' });
  const highest = [...plans].sort((a,b)=> (Number(b._si)||0) - (Number(a._si)||0) || (Number(a._prem)||0) - (Number(b._prem)||0))[0];
  if(highest && !tagById.has(highest.id)) tagById.set(highest.id, { badge:'Highest cover', badgeTone:'max' });
  for(const row of plans){
    const tag=tagById.get(row.id);
    if(tag){ row.badge=tag.badge; row.badgeTone=tag.badgeTone; }
  }

  const cur = Enrol.gmc;
  // Nothing pre-picked on a first visit — the plan must be an active choice.
  const initial = cur
    ? (plans.find(x=>x._planId===cur.planId && x._si===cur.si)||{}).id
    : null;

  G.paused = true;
  window.G = G;
  window.toast = toast;

  openPlanChooser({
    title: filterSi!=null ? ('Medical Cover · '+siShort(filterSi)) : 'Group Medical Cover',
    subtitle: 'Pick one shield. Covering: '+covered,
    plans,
    initialPlanId: initial,
    nudgeTitle: 'Pick a plan first',
    emptyNudge: 'Please choose the medical cover that suits you and your family before moving on.',
    confirmLabel: revisit ? 'Save medical cover' : 'Confirm plan & continue ▶',
    paintBackground: paintLevelBackground,
    onClose: ()=>{
      closePlanChooser();
      G.paused=false;
      for(const pr of (G.portals||[])) pr.entered=false;
      updateFocusChips();
    },
    onConfirm: (planId)=>{
      const row = plans.find(p=>p.id===planId);
      if(!row) return;
      Enrol.gmc={ planId:row._planId, planName:row._planName, si:row._si, prem:row._prem };
      G.done.gmc=true; updateHUD();
      Sprites.rebuildHero();
      G.paused=false;
      for(const pr of (G.portals||[])) pr.entered=false;
      toast(revisit ? 'Medical cover updated!' : 'Medical shield equipped!');
      // First clear only when confirming from this level's clinic portal.
      const shouldCompleteLevel = !revisit && (LEVELS[G.levelIdx]||{}).portals?.some(p=>p.kind==='gmc');
      // Offer a matching Super Top-Up (if this company has any) before the
      // level clears, so it reads as the natural next step after GMC.
      openSuperTopUp({revisit, onDone: ()=>{ if(shouldCompleteLevel) completeLevel(); }});
    },
  });
}

function openGMC(si){ openGmcFocusZone(si); }
function openGMCAll(){ openGmcFocusZone(null); }
function openGMCDesk(filterSi){ openGmcFocusZone(filterSi); }

/** Optional paid Super Top-Up riders shown right after a GMC plan is picked,
 *  filtered to whichever plan the player just chose (`Enrol.gmc.planId`).
 *  Skippable — closing via Back proceeds without picking one. `onDone` always
 *  fires exactly once, whether the player picks a tier, revisits and keeps
 *  their existing choice, or skips entirely (including when this company has
 *  no matching Super Top-Up data at all — a silent no-op for those). */
function openSuperTopUp(opts={}){
  const revisit = !!opts.revisit;
  const onDone = opts.onDone || (()=>{});
  const gmcPlanId = Enrol.gmc ? Enrol.gmc.planId : null;
  const options = (CONFIG.superTopUpPlans||[]).filter(p=>p.forGmcPlanId===gmcPlanId);
  if(!options.length){ onDone(); return; }
  playSfx('desk');
  G.paused = true; window.G = G;
  const cur = Enrol.superTopUp;
  const plans = options.map(p=>({
    id:p.id,
    name:p.name,
    tagline:p.desc,
    sumLabel: fmtINR(p.si)+' additional cover',
    priceLabel: fmtINR(p.prem)+' / family / year',
    priceSub: p.emi ? ('or EMIs · '+fmtINR(p.emi)+'/mo') : undefined,
    tone:'gold',
    bullets:[p.desc].filter(Boolean),
  }));
  const initial = cur ? (options.find(x=>x.id===cur.planId)||{}).id || null : null;
  openPlanChooser({
    title:'Super Top-Up',
    subtitle:'Optional extra cover for when your base plan runs out — tap Back if you\'d rather skip it.',
    plans,
    initialPlanId: initial,
    nudgeTitle: 'Pick a top-up, or go Back to skip',
    emptyNudge: 'Super Top-Up is optional and employee-paid — tap Back to continue without it.',
    confirmLabel: revisit ? 'Save Super Top-Up' : 'Add Super Top-Up ▶',
    paintBackground: paintLevelBackground,
    onClose: ()=>{
      closePlanChooser();
      G.paused=false;
      updateFocusChips();
      onDone();
    },
    onConfirm: (planId)=>{
      const p = options.find(x=>x.id===planId); if(!p) return;
      Enrol.superTopUp = { planId:p.id, name:p.name, si:p.si, prem:p.prem };
      G.done.superTopUp=true; updateHUD();
      G.paused=false;
      playSfx('confirm');
      toast(revisit ? 'Super Top-Up updated!' : 'Super Top-Up added!');
      onDone();
    },
  });
}

/* ---------- LEVEL 3: Wellbeing Bazaar add-ons ---------- */
function addonTone(id){
  if(id==='womens_care' || id==='pregnancy_care') return 'rose';
  if(id==='clove_dental' || id==='toothlens_family' || id==='toothlens_individual' || id==='vision_care') return 'teal';
  if(id==='opd_wallet' || id==='diabetes_care' || id==='home_healthcare') return 'amber';
  if(id==='annual_check' || id==='ortho_care') return 'violet';
  if(id==='ultrahuman_ring' || id==='cult_elite' || id==='cult_pro_onepass' || id==='cult_play') return 'gold';
  if(id==='fitpass_athome' || id==='fitpass_pro') return 'teal';
  if(id==='elder_care') return 'default';
  if(id==='pet_spa' || id==='dog_vax' || id==='cat_vax') return 'rose';
  return 'default';
}

/** L3 Focus Zone — pick optional add-ons (vertical grid), then clear the level. */
function openAddonBazaarFocusZone(opts={}){
  const revisit = !!opts.revisit;
  playSfx('desk');
  const covered = coveredMembers();
  const cards = CONFIG.addons.map(A=>{
    const elig = covered.filter(m=>A.elig(m));
    return {
      id: A.id,
      name: A.name,
      desc: A.desc,
      eligNote: A.eligNote,
      optionsLabel: A.optionsLabel,
      badge: A.badge,
      badgeTone: A.badgeTone,
      promo: !!A.promo,
      brand: A.brand || (A.per==='family' ? 'Family' : 'Member'),
      imageUrl: A.imageUrl || assetPath('branding/addons/'+A.id+'.png'),
      tone: A.tone || addonTone(A.id),
      features: A.features || [],
      bullets: [],
      _addon: A,
      _elig: elig,
    };
  });

  G.paused = true;
  window.G = G;
  window.toast = toast;

  openAddonBazaar({
    title: 'Wellbeing Bazaar',
    subtitle: 'Everyday benefits — add the ones you would really use, then continue.',
    cards,
    initialSelectedIds: Enrol.addons.map(a=>a.id),
    nudgeTitle: 'No add-ons yet',
    emptyNudge: 'Sure you want to skip? Add the wellness benefits you would actually use.',
    confirmLabel: revisit ? 'Save add-ons' : 'Confirm add-ons & continue ▶',
    paintBackground: paintLevelBackground,
    onClose: ()=>{
      closeAddonBazaar();
      G.paused=false;
      for(const pr of (G.portals||[])) pr.entered=false;
      updateFocusChips();
    },
    onConfirm: (ids)=>{
      const next=[];
      for(const id of ids){
        const row = cards.find(c=>c.id===id);
        if(!row) continue;
        const A = row._addon;
        const elig = row._elig || [];
        if(A.per==='family'){
          next.push({id:A.id, name:A.name, per:'family', memberIds:[], memberNames:[], cost:A.price});
        } else if(elig.length){
          next.push({
            id:A.id, name:A.name, per:'member',
            memberIds: elig.map(m=>m.id),
            memberNames: elig.map(m=>m.name),
            cost: A.price * elig.length,
          });
        } else {
          next.push({id:A.id, name:A.name, per:'member', memberIds:[], memberNames:[], cost:0});
        }
      }
      Enrol.addons = next;
      G.done.addon = true;
      updateHUD();
      Sprites.rebuildHero();
      G.paused=false;
      for(const pr of (G.portals||[])) pr.entered=false;
      playSfx('confirm');
      toast(revisit
        ? (next.length ? 'Add-ons updated!' : 'Add-ons cleared.')
        : (next.length ? (next.length+' add-on'+(next.length>1?'s':'')+' packed!') : 'No add-ons — continuing light!'));
      if(!revisit && (LEVELS[G.levelIdx]||{}).portals?.some(p=>p.kind==='addon')) completeLevel();
    },
  });
}

/** @deprecated plaza boards — redirects to bazaar Focus Zone */
function openAddon(_aid){
  openAddonBazaarFocusZone();
}

/* ---------- LEVEL 4: GTL + nominees ---------- */
function openGTL(opts={}){
  const revisit = !!opts.revisit;
  playSfx('desk');
  G.paused=true; window.G=G;
  if(!CONFIG.gtlPlans.length){ G.paused=false; toast('No term life plans configured for this company.'); return; }
  const cur=Enrol.gtl;
  const highestSi=Math.max(...CONFIG.gtlPlans.map((p)=>Number(p.si)||0));
  const cheapestPaid=[...CONFIG.gtlPlans]
    .filter((p)=>Number(p.prem)>0)
    .sort((a,b)=> (Number(a.prem)||0) - (Number(b.prem)||0) || (Number(b.si)||0)-(Number(a.si)||0))[0];
  const plans=CONFIG.gtlPlans.map(p=>{
    const isSponsored=Number(p.prem)===0;
    const isHighest=(Number(p.si)||0)===highestSi;
    const isBest=!!cheapestPaid && cheapestPaid.id===p.id && !isSponsored && !isHighest;
    const badge=isSponsored ? 'Company sponsored' : (isHighest ? 'Highest cover' : (isBest ? 'Best value' : undefined));
    const badgeTone=isSponsored ? 'sponsored' : (isHighest ? 'max' : (isBest ? 'value' : undefined));
    return {
      id:p.id,
      name:p.name,
      tagline:p.desc,
      sumLabel: fmtINR(p.si)+' sum insured',
      badge,
      badgeTone,
      tone: p.prem===0 ? 'base' : 'gold',
      bullets:[
        p.desc,
        'Sum insured: '+fmtINR(p.si),
        'Paid to your nominees if the worst happens',
        'Does not cover hospitalisation (that is GMC)',
      ],
    };
  });
  openPlanChooser({
    title:'Group Term Life',
    subtitle:'A safety net for your loved ones — compare and choose.',
    plans,
    initialPlanId: cur?cur.planId:null,
    nudgeTitle: 'Pick a cover first',
    emptyNudge: 'Please choose the term life cover you would really want for your loved ones.',
    confirmLabel: revisit ? 'Save term life' : 'Confirm cover ▶',
    paintBackground: paintLevelBackground,
    onClose:()=>{ closePlanChooser(); G.paused=false; updateFocusChips(); },
    onConfirm:(planId)=>{
      const p=CONFIG.gtlPlans.find(x=>x.id===planId); if(!p) return;
      Enrol.gtl={planId:p.id, name:p.name, si:p.si, prem:p.prem};
      G.done.gtl=true; updateHUD(); G.paused=false;
      Sprites.rebuildHero();
      playSfx('confirm');
      toast(revisit ? 'Term life updated!' : 'Life shield equipped! Now add nominees →');
    },
  });
}

function openNominees(){

  if(!Enrol.gtl) return openModal({title:'Nominees', body:'<p>Pick your Term Life cover first (the other E block in this level).</p>',
    buttons:[{label:'OK',cls:'primary',fn:c=>c()}]});
  const fam=Enrol.dependants;
  const isSel=x=>Enrol.nominees.some(n=>n.id===x.id);
  let body='<p class="muted">Nominees receive the term-life benefit. Pick from family or add another person. Shares split equally.</p>'+
    fam.map(x=>'<div class="checkline'+(isSel(x)?' sel':'')+'"><input type="checkbox" data-id="'+x.id+'" '+(isSel(x)?'checked':'')+'>'+
      '<span><b>'+x.name+'</b> <span class="muted">· '+x.relation+' · '+x.age+'</span></span></div>').join('')+
    '<div class="row" style="margin-top:14px;"><label>Or add another person (optional)</label>'+
    '<input type="text" id="n_name" placeholder="Name"><div style="height:6px"></div>'+
    '<input type="text" id="n_rel" placeholder="Relation (e.g. sibling, guardian)"></div>';
  const others=Enrol.nominees.filter(n=>!n.id);
  if(others.length) body+='<p class="muted">Also added: '+others.map(o=>o.name+' ('+o.relation+')').join(', ')+'</p>';

  const m=openModal({title:'Add Nominees', sub:'At least one nominee is required.', body, buttons:[
    {label:'Cancel',fn:c=>c()},
    {label:'Save nominees',cls:'good',fn:(c,m)=>{
      const noms=[];
      m.querySelectorAll('input[type=checkbox]:checked').forEach(cb=>{
        const d=fam.find(f=>f.id===cb.dataset.id);
        noms.push({id:d.id, name:d.name, relation:d.relation});
      });
      const on=m.querySelector('#n_name').value.trim(), or=m.querySelector('#n_rel').value.trim();
      if(on) noms.push({name:on, relation:or||'other'});
      for(const o of others) if(!noms.some(n=>n.name===o.name)) noms.push(o);
      if(!noms.length) return toast('Add at least one nominee');
      const share=Math.floor(100/noms.length);
      noms.forEach((n,i)=>n.share = i===0 ? 100-share*(noms.length-1) : share);
      Enrol.nominees=noms; G.done.nominees=true; c();
      toast('Nominees saved: '+noms.map(n=>n.name).join(', '));
    }}]});
  m.querySelectorAll('.checkline').forEach(l=>{
    const cb=l.querySelector('input');
    l.onclick=e=>{ if(e.target!==cb){cb.checked=!cb.checked;} l.classList.toggle('sel',cb.checked); };
  });
}



/*═══════════════════════════════════════════════════════════════════
  8) SCREENS — title, summary, sprite studio, data view — and scoring
═══════════════════════════════════════════════════════════════════*/
const screens=['titleUI','setupUI','studioUI','dataUI','summaryUI'];
function showScreen(id){
  screens.forEach(s=>{
    const el=document.getElementById(s);
    if(el) el.style.display = s===id?'block':'none';
  });
  document.getElementById('hud').style.display='none';
}
function hideScreens(){ screens.forEach(s=>{ const el=document.getElementById(s); if(el) el.style.display='none'; }); }

/* ---------- TITLE ---------- */
const TITLE_HOME_MENU=[
  { id:'start', label:'START NEW GAME', mini:'begin your benefits adventure', cls:'primaryStart', fn:()=>startGame() },
];
const TITLE_ADMIN_MENU=[
  { id:'level4', label:'LEVEL 4', mini:'', fn:()=>toggleLevel4() },
  { id:'demo', label:'DEMO MODE', mini:'jump stages · skip save', fn:()=>openDemoPanel() },
  { id:'studio', label:'SPRITE STUDIO', mini:'upload / reset art', fn:()=>{ closeTitleAdmin(); showStudio(); } },
  { id:'mode', label:'MODE', mini:'', fn:()=>cycleTitleMode() },
  { id:'company', label:'COMPANY', mini:'', fn:()=>cycleCompany() },
  { id:'data', label:'GAME DATA', mini:'local + cloud plays', fn:()=>{ closeTitleAdmin(); showData(); } },
];
let menuIdx=0;
let titleMenuMode='home'; // 'home' | 'admin' | 'demo'

function level4MenuLabel(){ return 'LEVEL 4: '+(CONFIG.enableLevel4?'ON':'OFF'); }
function level4MenuMini(){
  return CONFIG.enableLevel4
    ? 'full 4-level campaign · term life'
    : 'off · longer L1–L3 compact run';
}
function toggleLevel4(){
  CONFIG.enableLevel4 = !CONFIG.enableLevel4;
  saveLevel4Pref();
  applyLevelRoster();
  fillTitleMenu('titleAdminMenu', TITLE_ADMIN_MENU);
  refreshMenuFocus();
  fillDemoJumpGrid();
  fillDemoBarJumps();
  toast(CONFIG.enableLevel4
    ? 'Level 4 ON — term life is in the run'
    : 'Level 4 OFF — L1–L3 are longer & denser');
}

const DEMO_JUMPS=[
  { id:'setup',   label:'Hero setup',     mini:'character creator' },
  { id:'l1',      label:'Level 1',        mini:'Family First' },
  { id:'l2',      label:'Level 2',        mini:'Medical Cover' },
  { id:'l3',      label:'Level 3',        mini:'Add-ons' },
  { id:'l4',      label:'Level 4',        mini:'Term Life' },
  { id:'family',  label:'Family zone',    mini:'L1 focus overlay' },
  { id:'gmc',     label:'GMC plans',      mini:'L2 focus overlay' },
  { id:'addons',  label:'Addon bazaar',   mini:'L3 focus overlay' },
  { id:'gtl',     label:'Term life desk', mini:'L4 GTL chooser' },
  { id:'summary', label:'Summary',        mini:'course clear screen' },
  { id:'title',   label:'Title screen',   mini:'back to home' },
];
const DEMO_BAR_JUMPS=[
  { id:'setup', label:'Setup' },
  { id:'l1', label:'L1' },
  { id:'l2', label:'L2' },
  { id:'l3', label:'L3' },
  { id:'l4', label:'L4' },
  { id:'family', label:'Family' },
  { id:'gmc', label:'GMC' },
  { id:'addons', label:'Addons' },
  { id:'summary', label:'Summary' },
];

function syncModeBadge(){
  // Mode badge removed from title chrome — mode still toggles in Admin.
  const el=document.getElementById('modeBadge');
  if(el) el.textContent='MODE: '+CONFIG.MODE.toUpperCase();
}
function syncCompanyBranding(){
  const company=document.getElementById('titleCompany');
  if(company) company.textContent=CONFIG.COMPANY+' · '+CONFIG.TAGLINE;
  document.title='Enrolment Quest — '+CONFIG.titleSuffix;

  const partnerWrap=document.querySelector('.titlePartners');
  const partnerA=document.querySelector('.titlePartnerTarento');
  const partnerB=document.querySelector('.titlePartnerLoop');
  const partnerX=document.querySelector('.titlePartnerX');
  const partners=CONFIG.partners||[];
  if(partnerA && partners[0]){
    partnerA.src=partners[0].logoUrl;
    partnerA.alt=partners[0].name;
  }
  if(partnerB && partners[1]){
    partnerB.src=partners[1].logoUrl;
    partnerB.alt=partners[1].name;
  }
  if(partnerB) partnerB.style.display=partners[1]?'block':'none';
  if(partnerX) partnerX.style.display=partners[1]?'inline-block':'none';
  if(partnerWrap){
    const partnerNames=partners.map((p)=>p.name).join(' × ') || CONFIG.COMPANY;
    partnerWrap.setAttribute('aria-label', partnerNames);
  }

  const qr=document.getElementById('checkoutQr');
  if(qr){
    qr.src=CONFIG.PORTAL_QR_URL;
    qr.alt='QR code — opens '+CONFIG.PORTAL_HOST_LABEL;
  }
  const portal=document.getElementById('checkoutPortalLink');
  if(portal){
    portal.href=CONFIG.PORTAL_URL;
    portal.textContent=CONFIG.PORTAL_HOST_LABEL;
  }
  const successBtn=document.getElementById('successPortalBtn');
  if(successBtn) successBtn.href=CONFIG.PORTAL_URL;
  const successBody=document.querySelector('.checkoutSuccessBody');
  if(successBody) successBody.textContent=CONFIG.PORTAL_SUPPORT_COPY;
}
function syncTitleSoundBtn(){
  const btn=document.getElementById('titleSoundBtn');
  if(!btn) return;
  const off=isMuted();
  btn.classList.toggle('is-muted', off);
  btn.setAttribute('aria-pressed', off?'true':'false');
  const label=off?'Sound off':'Sound on';
  btn.title=label;
  btn.setAttribute('aria-label', label);
}
function modeMenuLabel(){ return 'MODE: '+CONFIG.MODE.toUpperCase(); }
function modeMenuMini(){
  return CONFIG.MODE==='live'?'live enrolment API':'interest only — no real enrol';
}
function companyMenuLabel(){ return 'COMPANY: '+CONFIG.COMPANY; }
function companyMenuMini(){
  const all=listCompanies();
  const idx=Math.max(0, all.findIndex((p)=>p.id===CONFIG.activeCompanyId));
  return (idx+1)+' / '+all.length+' · '+CONFIG.activeCompanyId;
}

function fillTitleMenu(hostId, items){
  const menu=document.getElementById(hostId); if(!menu) return;
  menu.innerHTML='';
  items.forEach((it,i)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='menuItem'+(it.cls?(' '+it.cls):'')+(i===menuIdx?' focus':'');
    const label = it.id==='mode' ? modeMenuLabel()
      : it.id==='level4' ? level4MenuLabel()
      : it.id==='company' ? companyMenuLabel()
      : it.label;
    const mini = it.id==='mode' ? modeMenuMini()
      : it.id==='level4' ? level4MenuMini()
      : it.id==='company' ? companyMenuMini()
      : it.mini;
    b.innerHTML=label+(mini?'<span class="mini">'+mini+'</span>':'');
    b.onclick=()=>{ playSfx('click'); it.fn(); };
    b.onmouseenter=()=>{ menuIdx=i; refreshMenuFocus(); };
    menu.appendChild(b);
  });
}

function setTitleControlsOpen(open){
  const btn=document.getElementById('titleControlsToggle');
  const pop=document.getElementById('titleControlsPop');
  if(!btn || !pop) return;
  pop.hidden=!open;
  btn.setAttribute('aria-expanded', open?'true':'false');
}

function wireTitleChrome(){
  const adminBtn=document.getElementById('titleAdminBtn');
  if(adminBtn) adminBtn.onclick=()=>{ playSfx('click'); openTitleAdmin(); };
  const soundBtn=document.getElementById('titleSoundBtn');
  if(soundBtn) soundBtn.onclick=()=>toggleTitleSound();
  syncTitleSoundBtn();
  const ctrlBtn=document.getElementById('titleControlsToggle');
  if(ctrlBtn) ctrlBtn.onclick=()=>{
    playSfx('click');
    const pop=document.getElementById('titleControlsPop');
    setTitleControlsOpen(!!(pop && pop.hidden));
  };
  const back=document.getElementById('titleAdminBack');
  if(back) back.onclick=()=>{ playSfx('click'); closeTitleAdmin(); };
  wireDemoChrome();
}

function syncDemoBar(){
  const bar=document.getElementById('demoBar');
  if(!bar) return;
  bar.hidden=!isDemoMode();
  const skip=document.getElementById('demoSkipValidation');
  const skipBar=document.getElementById('demoBarSkipVal');
  if(skip) skip.checked=getDemoSkipValidation();
  if(skipBar) skipBar.checked=getDemoSkipValidation();
  const line=document.getElementById('demoSkipValLine');
  if(line) line.classList.toggle('sel', getDemoSkipValidation());
}

function fillDemoJumpGrid(){
  const grid=document.getElementById('demoJumpGrid');
  if(!grid) return;
  grid.innerHTML='';
  DEMO_JUMPS.forEach(j=>{
    if(!CONFIG.enableLevel4 && (j.id==='l4' || j.id==='gtl')) return;
    const b=document.createElement('button');
    b.type='button';
    b.className='demoJumpBtn';
    b.innerHTML=j.label+(j.mini?'<span class="djMini">'+j.mini+'</span>':'');
    b.onclick=()=>{ playSfx('click'); demoJump(j.id); };
    grid.appendChild(b);
  });
}

function fillDemoBarJumps(){
  const host=document.getElementById('demoBarJumps');
  if(!host) return;
  host.innerHTML='';
  DEMO_BAR_JUMPS.forEach(j=>{
    if(!CONFIG.enableLevel4 && j.id==='l4') return;
    const b=document.createElement('button');
    b.type='button';
    b.textContent=j.label;
    b.onclick=()=>{ playSfx('click'); demoJump(j.id); };
    host.appendChild(b);
  });
}

function wireDemoChrome(){
  fillDemoJumpGrid();
  fillDemoBarJumps();
  const skip=document.getElementById('demoSkipValidation');
  const skipBar=document.getElementById('demoBarSkipVal');
  const syncSkip=()=>{
    const on=!!(skip&&skip.checked);
    setDemoSkipValidation(on);
    if(skipBar) skipBar.checked=on;
    const line=document.getElementById('demoSkipValLine');
    if(line) line.classList.toggle('sel', on);
  };
  if(skip) skip.onchange=syncSkip;
  if(skipBar) skipBar.onchange=()=>{
    setDemoSkipValidation(!!skipBar.checked);
    if(skip) skip.checked=skipBar.checked;
    const line=document.getElementById('demoSkipValLine');
    if(line) line.classList.toggle('sel', skipBar.checked);
  };
  const demoBack=document.getElementById('titleDemoBack');
  if(demoBack) demoBack.onclick=()=>{ playSfx('click'); closeDemoPanel(); };
  const demoExit=document.getElementById('titleDemoExit');
  if(demoExit) demoExit.onclick=()=>{ playSfx('click'); demoJump('exit'); };
  const barExit=document.getElementById('demoBarExit');
  if(barExit) barExit.onclick=()=>{ playSfx('click'); demoJump('exit'); };
  syncDemoBar();
}

function openDemoPanel(){
  setDemoMode(true);
  titleMenuMode='demo';
  ensureDemoSession();
  const home=document.getElementById('titleAdminHome');
  const panel=document.getElementById('titleDemoPanel');
  if(home) home.hidden=true;
  if(panel) panel.hidden=false;
  syncDemoBar();
  toast('Demo mode ON — nothing will be saved');
}

function closeDemoPanel(){
  titleMenuMode='admin'; menuIdx=0;
  const home=document.getElementById('titleAdminHome');
  const panel=document.getElementById('titleDemoPanel');
  if(panel) panel.hidden=true;
  if(home) home.hidden=false;
  fillTitleMenu('titleAdminMenu', TITLE_ADMIN_MENU);
  refreshMenuFocus();
  syncDemoBar();
}

function ensureDemoSession(){
  setDemoMode(true);
  const ch=Enrol.character;
  if(!ch.name) ch.name='Demo Hero';
  if(!ch.gender) ch.gender='female';
  if(!ch.age) ch.age=30;
  if(!ch.marital) ch.marital='married';
  const prev=getPlayerSession();
  setPlayerSession({
    fullName: prev?.fullName || ch.name || 'Demo Hero',
    department: prev?.department || 'Demo',
    notEmployee: true,
  });
  Sprites.rebuildHero();
  syncDemoBar();
}

let _demoJumpTimer=null;

function demoCloseOverlays(){
  if(_demoJumpTimer){ clearTimeout(_demoJumpTimer); _demoJumpTimer=null; }
  try{ closeFocusZone(); }catch(e){}
  try{ closePlanChooser(); }catch(e){}
  try{ closeAddonBazaar(); }catch(e){}
  const modal=document.getElementById('modalLayer');
  if(modal) modal.style.display='none';
  // Family focus hides #game; closeFocusZone skips onClose so always restore.
  restoreGameCanvas();
  clearEnemyIntroUI(false);
  G.paused=false;
}

function demoEnterPlay(levelIdx){
  ensureDemoSession();
  if(heroAnimTimer) clearInterval(heroAnimTimer);
  demoCloseOverlays();
  resetEnemyIntroSession();
  const admin=document.getElementById('titleAdmin');
  if(admin) admin.hidden=true;
  const panel=document.getElementById('titleDemoPanel');
  if(panel) panel.hidden=true;
  const home=document.getElementById('titleAdminHome');
  if(home) home.hidden=false;
  titleMenuMode='home';
  hideScreens();
  document.getElementById('hud').style.display='flex';
  G.state='play';
  G.paused=false;
  buildLevel(levelIdx);
  syncDemoBar();
  toast('DEMO · '+(LEVELS[levelIdx]?.name || ('Level '+(levelIdx+1))));
}

function demoJump(stage){
  ensureDemoSession();
  // Cancel any pending overlay open from a prior jump (Family/GMC/Addons/GTL).
  if(_demoJumpTimer){ clearTimeout(_demoJumpTimer); _demoJumpTimer=null; }
  if(stage==='exit'){
    setDemoMode(false);
    clearPlayerSession();
    demoCloseOverlays();
    const bar=document.getElementById('demoBar');
    if(bar) bar.hidden=true;
    const admin=document.getElementById('titleAdmin');
    if(admin) admin.hidden=true;
    const panel=document.getElementById('titleDemoPanel');
    if(panel) panel.hidden=true;
    const home=document.getElementById('titleAdminHome');
    if(home) home.hidden=false;
    titleMenuMode='home';
    showTitle();
    toast('Demo mode off');
    return;
  }
  if(stage==='title'){
    demoCloseOverlays();
    const admin=document.getElementById('titleAdmin');
    if(admin) admin.hidden=true;
    const panel=document.getElementById('titleDemoPanel');
    if(panel) panel.hidden=true;
    const home=document.getElementById('titleAdminHome');
    if(home) home.hidden=false;
    titleMenuMode='home';
    showTitle();
    syncDemoBar();
    return;
  }
  if(stage==='setup'){
    demoCloseOverlays();
    const admin=document.getElementById('titleAdmin');
    if(admin) admin.hidden=true;
    showSetup();
    syncDemoBar();
    return;
  }
  if(stage==='summary'){
    demoCloseOverlays();
    const admin=document.getElementById('titleAdmin');
    if(admin) admin.hidden=true;
    showSummary();
    syncDemoBar();
    return;
  }
  if(stage==='l1'){ demoEnterPlay(0); return; }
  if(stage==='l2'){ demoEnterPlay(1); return; }
  if(stage==='l3'){ demoEnterPlay(2); return; }
  if(stage==='l4'){
    if(!CONFIG.enableLevel4){ toast('Level 4 is OFF — turn it on in Admin'); return; }
    demoEnterPlay(3); return;
  }
  if(stage==='family'){
    demoEnterPlay(0);
    _demoJumpTimer=setTimeout(()=>{
      _demoJumpTimer=null;
      try{ openFamilyFocusZone(); }catch(e){ toast('Family zone unavailable'); }
    }, 120);
    return;
  }
  if(stage==='gmc'){
    demoEnterPlay(1);
    _demoJumpTimer=setTimeout(()=>{
      _demoJumpTimer=null;
      try{ openGmcFocusZone(null); }catch(e){ toast('GMC zone unavailable'); }
    }, 120);
    return;
  }
  if(stage==='addons'){
    demoEnterPlay(2);
    _demoJumpTimer=setTimeout(()=>{
      _demoJumpTimer=null;
      try{ openAddonBazaarFocusZone(); }catch(e){ toast('Addon zone unavailable'); }
    }, 120);
    return;
  }
  if(stage==='gtl'){
    if(!CONFIG.enableLevel4){ toast('Level 4 is OFF — turn it on in Admin'); return; }
    demoEnterPlay(3);
    _demoJumpTimer=setTimeout(()=>{
      _demoJumpTimer=null;
      try{ openGTL(); }catch(e){ toast('GTL desk unavailable'); }
    }, 120);
    return;
  }
}

function openTitleAdmin(){
  titleMenuMode='admin'; menuIdx=0;
  setTitleControlsOpen(false);
  const home=document.getElementById('titleHome');
  const admin=document.getElementById('titleAdmin');
  const corner=document.getElementById('titleCornerCluster');
  const adminHome=document.getElementById('titleAdminHome');
  const demoPanel=document.getElementById('titleDemoPanel');
  if(home) home.style.visibility='hidden';
  if(admin) admin.hidden=false;
  if(corner) corner.hidden=true;
  if(adminHome) adminHome.hidden=false;
  if(demoPanel) demoPanel.hidden=true;
  fillTitleMenu('titleAdminMenu', TITLE_ADMIN_MENU);
  refreshMenuFocus();
}
function closeTitleAdmin(){
  titleMenuMode='home'; menuIdx=0;
  const home=document.getElementById('titleHome');
  const admin=document.getElementById('titleAdmin');
  const corner=document.getElementById('titleCornerCluster');
  const adminHome=document.getElementById('titleAdminHome');
  const demoPanel=document.getElementById('titleDemoPanel');
  if(admin) admin.hidden=true;
  if(home) home.style.visibility='visible';
  if(corner) corner.hidden=false;
  if(adminHome) adminHome.hidden=false;
  if(demoPanel) demoPanel.hidden=true;
  fillTitleMenu('titleMenu', TITLE_HOME_MENU);
  refreshMenuFocus();
}
function toggleTitleSound(){
  setMuted(!isMuted());
  syncTitleSoundBtn();
  if(!isMuted()){
    try{ startMusic(); }catch(e){}
    playSfx('click');
  }
}
function cycleTitleMode(){
  CONFIG.MODE = CONFIG.MODE==='interest' ? 'live' : 'interest';
  syncModeBadge();
  fillTitleMenu('titleAdminMenu', TITLE_ADMIN_MENU);
  refreshMenuFocus();
  toast('Mode → '+CONFIG.MODE.toUpperCase());
}
function cycleCompany(){
  const all=listCompanies();
  if(!all.length) return;
  const idx=Math.max(0, all.findIndex((p)=>p.id===CONFIG.activeCompanyId));
  const next=all[(idx+1)%all.length];
  setActiveCompany(next.id);
  applyActiveCompanyProfile({ preserveMode:true, preserveLevel4:true });
  saveCompanyPref();
  applyLevelRoster();
  syncModeBadge();
  syncCompanyBranding();
  fillTitleMenu('titleAdminMenu', TITLE_ADMIN_MENU);
  refreshMenuFocus();
  fillDemoJumpGrid();
  fillDemoBarJumps();
  refreshTitleLeaderboard();
  toast('Company → '+CONFIG.COMPANY);
}

async function refreshTitleLeaderboard(){
  const body=document.getElementById('titleLeaderboardBody');
  if(!body) return;
  const rows=[];
  // Cloud Hall of Fame (anon RPC — plays table itself is insert-only)
  try{
    const cloud=await fetchHallOfFame(8);
    for(const c of cloud){
      rows.push({
        playerName: c.display_name,
        department: c.department || '',
        score: Number(c.score)||0,
        grade: c.grade || '—',
        id: 'cloud:'+c.display_name+':'+c.score,
        ts: 'cloud',
      });
    }
  }catch(e){}
  try{
    const r=await Store.list('play:', true);
    for(const k of (r.keys||[])){
      try{
        const rec=await Store.get(k, true);
        if(rec){
          const row=normalizePlayRow(JSON.parse(rec.value));
          if(rowBelongsToActiveCompany(row)) rows.push(row);
        }
      }catch(e){}
    }
  }catch(e){}
  try{
    for(const raw of listLocalPlays()){
      try{
        const row=normalizePlayRow(raw);
        if(rowBelongsToActiveCompany(row)) rows.push(row);
      }catch(e){}
    }
  }catch(e){}
  const seen=new Set(); const uniq=[];
  for(const p of rows){
    // Dedupe by player+score so local mirrors of the same cloud run don't double-count
    const name=(p.playerName||p.character?.name||'Player').toString().toLowerCase();
    const key=name+'|'+(Number(p.score)||0);
    if(seen.has(key)) continue;
    seen.add(key); uniq.push(p);
  }
  uniq.sort((a,b)=> (Number(b.score)||0) - (Number(a.score)||0));
  const top=uniq.slice(0,8);
  if(!top.length){
    body.innerHTML='<p class="muted">Be the first champion — finish a run to claim the board.</p>';
    return;
  }
  const titleLbText=(value, max)=>{
    const span=document.createElement('span');
    span.textContent=(value||'').toString().slice(0,max);
    return span.innerHTML;
  };
  body.innerHTML=top.map((p,i)=>{
    const name=titleLbText(p.playerName||p.character?.name||'Player', 14);
    const department=titleLbText(p.department||p.player?.department||'Department not set', 18);
    const score=Number(p.score)||0;
    const grade=titleLbText(p.grade||'—', 4);
    const topCls=i<3?(' titleLbTop'+(i+1)):'';
    return '<div class="titleLbRow'+topCls+'"><span class="titleLbRank">'+(i+1)+'</span>'+
      '<span class="titleLbIdentity"><span class="titleLbName">'+name+'</span>'+
      '<span class="titleLbDept">'+department+'</span></span><span class="titleLbScore">'+score+'</span>'+
      '<span class="titleLbGrade">'+grade+'</span></div>';
  }).join('');
}

function showTitle(){
  // Drop any leftover focus/plan overlays + restore #game (Family zone hides it).
  if(_demoJumpTimer){ clearTimeout(_demoJumpTimer); _demoJumpTimer=null; }
  hideLevelResultsUI();
  closePauseMenuUI();
  try{ closeFocusZone(); }catch(e){}
  try{ closePlanChooser(); }catch(e){}
  try{ closeAddonBazaar(); }catch(e){}
  restoreGameCanvas();
  clearEnemyIntroUI(false);
  G.paused=false;
  G.wipe=0; G.shake=0;
  G.state='title'; G.t=0; hideScreens(); showScreen('titleUI');
  _titleChatHero=-1;
  const tb=document.getElementById('titleChatBubble');
  if(tb){ tb.classList.remove('is-on'); tb.hidden=true; }
  if(heroAnimTimer) clearInterval(heroAnimTimer);
  if(typeof famTimer!=='undefined' && famTimer) clearInterval(famTimer);
  famTimer=null;
  if(typeof _courtResize!=='undefined' && _courtResize){ window.removeEventListener('resize', _courtResize); _courtResize=null; }
  titleMenuMode='home'; menuIdx=0;
  syncModeBadge();
  syncCompanyBranding();
  const home=document.getElementById('titleHome');
  const admin=document.getElementById('titleAdmin');
  const corner=document.getElementById('titleCornerCluster');
  const adminHome=document.getElementById('titleAdminHome');
  const demoPanel=document.getElementById('titleDemoPanel');
  if(home) home.style.visibility='visible';
  if(admin) admin.hidden=true;
  if(corner) corner.hidden=false;
  if(adminHome) adminHome.hidden=false;
  if(demoPanel) demoPanel.hidden=true;
  setTitleControlsOpen(false);
  syncTitleSoundBtn();
  // branding logo (optional)
  if(!G._logoImg){
    const tryLogo=(url, next)=>{
      if(!url){ if(next) next(); return; }
      const img=new Image();
      img.onload=()=>{ G._logoImg=img; };
      img.onerror=()=>{ if(next) next(); };
      img.src=url;
    };
    tryLogo(CONFIG.LOGO_URL, ()=>tryLogo(CONFIG.LOGO_FALLBACK_URL));
  }
  try{ startMusic(); }catch(e){}
  wireTitleChrome();
  fillTitleMenu('titleMenu', TITLE_HOME_MENU);
  refreshMenuFocus();
  refreshTitleLeaderboard();
  syncDemoBar();
  // Force sky cache refresh so authored bg_title shows after install
  G._skySrc=null; G._skyCv=null;
}
function refreshMenuFocus(){
  if(titleMenuMode==='demo') return;
  const host = titleMenuMode==='admin' ? '#titleAdminMenu' : '#titleMenu';
  document.querySelectorAll(host+' .menuItem').forEach((el,i)=>el.classList.toggle('focus',i===menuIdx));
}
addEventListener('keydown',e=>{
  if(G.state!=='title') return;
  if(e.key==='Escape'){
    if(titleMenuMode==='demo'){ closeDemoPanel(); return; }
    if(titleMenuMode==='admin'){ closeTitleAdmin(); return; }
    const pop=document.getElementById('titleControlsPop');
    if(pop && !pop.hidden){ setTitleControlsOpen(false); return; }
  }
  if(titleMenuMode==='demo') return;
  const items = titleMenuMode==='admin' ? TITLE_ADMIN_MENU : TITLE_HOME_MENU;
  if(e.key==='ArrowDown'){menuIdx=(menuIdx+1)%items.length; refreshMenuFocus();}
  if(e.key==='ArrowUp'){menuIdx=(menuIdx+items.length-1)%items.length; refreshMenuFocus();}
  if(e.key==='Enter'||e.key===' ') items[menuIdx].fn();
});

let _playAssetsReady = false;
let _playAssetsPromise = null;
let _deferAssetsPromise = null;

function startGame(){
  // Real employee play path — leave admin Demo Mode
  const go = ()=>{
    setDemoMode(false);
    syncDemoBar();
    clearPlayerSession();
    resetEnemyIntroSession();
    try{ startMusic(); }catch(e){}
    Object.assign(Enrol,{character:{name:'',gender:'',age:null,marital:'',skin:2},
      dependants:[],covered:[],gmc:null,addons:[],gtl:null,superTopUp:null,nominees:[],startedAt:Date.now()});
    depSeq=1; G.coinsGot=0; G.stomps=0; G.deaths=0; G.timeSpent=0;
    G.done={}; G.deathSpot=null; G.introFocus=null; G.introGapUntil=0;
    Sprites.rebuildHero();
    showSetup();
  };
  if(_playAssetsReady){ go(); return; }
  toast('Finishing download…');
  Promise.resolve(_playAssetsPromise).then(()=>{ _playAssetsReady=true; go(); })
    .catch(()=>{ toast('Still loading art — try again in a moment'); });
}

/* ---------- UNIFIED HERO SETUP ----------
   Identity + look on one screen. Preview uses the same front-facing gender-pack
   art as the title lineup (not the old side-view run cycle / CSS grass box). */
let heroAnimTimer=null;

function paintSetupHeroPreview(canvas, tick){
  const size=256;
  if(canvas.width!==size){ canvas.width=size; canvas.height=size; }
  const x=canvas.getContext('2d');
  if(!x) return;
  x.imageSmoothingEnabled=false;
  x.clearRect(0,0,size,size);

  const ch=Enrol.character||{};
  if(!ch.gender) return;

  // Same front-facing gender-pack art as the title lineup (not side-view run)
  const packFront = Sprites.genderPacks[ch.gender]?.base?.hero_front;
  const frames = (packFront && packFront.length)
    ? packFront
    : (Sprites.frames.hero_front || []);
  if(!frames.length) return;

  const af=frontIdleFrame(tick, frames.length, 0, 10);
  const fr=frames[af];
  if(!fr) return;

  // Stand on the circular title stage (CSS background) — feet on the grass rim
  const maxW=size*0.88, maxH=size*0.72;
  const sc=Math.min(maxW/fr.width, maxH/fr.height);
  const dw=Math.round(fr.width*sc), dh=Math.round(fr.height*sc);
  const dx=Math.round((size-dw)/2);
  const dy=Math.round(size*0.78 - dh);
  x.drawImage(fr, 0,0,fr.width,fr.height, dx,dy,dw,dh);
}

function showSetup(){
  G.state='setup'; hideScreens(); showScreen('setupUI');
  // Don't let the frozen title canvas ghost under the setup overlay
  const gameCv=document.getElementById('game');
  if(gameCv) gameCv.style.visibility='hidden';

  const err=document.getElementById('s_err');
  err.style.display='none'; err.textContent='';

  const ch=Enrol.character;
  const prev=getPlayerSession();
  document.getElementById('s_name').value = ch.name || prev?.fullName || '';
  document.getElementById('s_dept').value = prev?.department || '';
  document.getElementById('s_age').value = ch.age || '';

  const mkCards=(elId, values, cur, set, rebuild=true)=>{
    const box=document.getElementById(elId); box.innerHTML='';
    values.forEach(v=>{
      const c=document.createElement('div');
      c.className='optcard'+(cur===v?' sel':''); c.dataset.v=v;
      c.innerHTML='<span class="t">'+v[0].toUpperCase()+v.slice(1)+'</span>';
      c.onclick=()=>{
        box.querySelectorAll('.optcard').forEach(o=>o.classList.remove('sel'));
        c.classList.add('sel'); set(v); heroChanged(rebuild);
      };
      box.appendChild(c);
    });
  };
  mkCards('s_gender', ['male','female','other'], ch.gender, v=>{ ch.gender=v; }, true);
  mkCards('s_marital',['single','married','other'], ch.marital, v=>{ ch.marital=v; }, false);

  // Demo Mode (admin): optional validation + defaults — no checkbox on this screen
  const demo=isDemoMode();
  const skipVal=isDemoSkipValidation();
  ['s_name','s_dept','s_age'].forEach(id=>{
    const el=document.getElementById(id);
    el.required=false;
    el.placeholder = (demo && skipVal)
      ? (id==='s_name'?'Optional in demo':id==='s_dept'?'Optional in demo':'Optional')
      : (id==='s_name'?'e.g. Priya Sharma':id==='s_dept'?'e.g. Engineering':'e.g. 32');
  });
  document.getElementById('label_s_name').textContent = (demo && skipVal) ? 'Full name (optional)' : 'Full name';
  document.getElementById('label_s_dept').textContent = (demo && skipVal) ? 'Department (optional)' : 'Department';
  document.getElementById('s_start').textContent = demo ? 'PLAY DEMO ▶' : 'START ADVENTURE ▶';
  if(demo && !ch.gender){
    ch.gender='female';
    document.querySelectorAll('#s_gender .optcard').forEach(o=>{
      o.classList.toggle('sel', o.dataset.v==='female');
    });
    heroChanged(true);
  }

  document.getElementById('s_name').oninput = e=>{
    ch.name=e.target.value.trim();
    heroChanged(false);
  };
  document.getElementById('s_age').oninput = e=>{
    const v=parseInt(e.target.value,10); ch.age = isNaN(v)?null:v; heroChanged(false);
  };
  document.getElementById('s_start').onclick = beginAdventure;

  // Front-facing gender-pack idle on authored ground tiles (matches title look)
  let tick=0; clearInterval(heroAnimTimer);
  heroAnimTimer=setInterval(()=>{
    const c=document.getElementById('bigHero'); if(!c) return;
    paintSetupHeroPreview(c, tick++);
  }, 90);

  heroChanged(true);
  syncDemoBar();
  setTimeout(()=>document.getElementById('s_name').focus(), 60);
}

function heroChanged(rebuild=true){
  if(rebuild) Sprites.rebuildHero();
  const ch=Enrol.character;
  const nameEl=document.getElementById('s_heroName');
  const tagsEl=document.getElementById('s_heroTags');
  if(nameEl) nameEl.textContent = ch.name || 'Your hero';
  const tags=[];
  if(ch.gender) tags.push(ch.gender[0].toUpperCase()+ch.gender.slice(1));
  if(ch.age) tags.push(ch.age+' yrs');
  if(ch.marital) tags.push(ch.marital[0].toUpperCase()+ch.marital.slice(1));
  if(tagsEl) tagsEl.textContent =
    tags.length ? tags.join(' · ') : 'Pick a gender to preview';
}

function beginAdventure(){
  const ch=Enrol.character;
  const demo=isDemoMode();
  const skipVal=isDemoSkipValidation();
  const fullName=document.getElementById('s_name').value.trim();
  const department=document.getElementById('s_dept').value.trim();
  const err=document.getElementById('s_err');
  err.style.display='none'; err.textContent='';

  if(!skipVal){
    if(fullName.length<2){ err.style.display='block'; err.textContent='Please enter your full name.'; return; }
    if(department.length<1){ err.style.display='block'; err.textContent='Please enter your department.'; return; }
    if(!ch.gender){ err.style.display='block'; err.textContent='Pick a gender.'; return; }
    if(!ch.age || ch.age<18 || ch.age>70){ err.style.display='block'; err.textContent='Enter an age between 18 and 70.'; return; }
    if(!ch.marital){ err.style.display='block'; err.textContent='Pick a marital status.'; return; }
  } else if(demo){
    // Demo + skip validation: fill sensible defaults for anything blank
    if(!ch.name) ch.name = fullName || 'Demo Hero';
    if(!ch.gender) ch.gender = 'female';
    if(!ch.age) ch.age = 30;
    if(!ch.marital) ch.marital = 'married';
  }

  ch.name = fullName || ch.name || 'Hero';
  setPlayerSession({
    fullName: fullName || ch.name,
    department: department || (demo ? 'Demo' : ''),
    notEmployee: demo,
  });

  clearInterval(heroAnimTimer);
  Sprites.rebuildHero();
  restoreGameCanvas();
  hideScreens();
  document.getElementById('hud').style.display='flex';
  resetEnemyIntroSession();
  G.state='play';
  buildLevel(0);
  syncDemoBar();
  toast(demo
    ? 'Demo mode — nothing will be saved. Level 1 awaits!'
    : 'Level 1: run right \u2014 your family is waiting at the cottage. Walk in or press E!');
}

/* ---------- SCORE ---------- */
function computeScore(){
  const cov=coveredMembers().length;
  const n=LEVELS.length;
  const deps=Enrol.dependants.length;
  const gmcId=String((Enrol.gmc&&Enrol.gmc.planId)||'');
  const gmcPick = !Enrol.gmc ? 0
    : gmcId.includes('diamond') ? 520
    : gmcId.includes('gold') ? 360
    : 160;
  const gtlBoost = Enrol.gtl && ((Enrol.gtl.si|0)>=5000000 || String(Enrol.gtl.planId||'').includes('50')) ? 320
    : Enrol.gtl ? 160 : 0;
  const parts=[
    {label:'Levels cleared', pts:n*500},
    {label:'Coins collected ('+G.coinsGot+')', pts:G.coinsGot*50},
    {label:'Enemies stomped ('+G.stomps+')', pts:G.stomps*150},
    {label:'Family joined ('+deps+')', pts:deps*220},
    {label:'Family covered ('+cov+' member'+(cov!==1?'s':'')+')', pts:cov*200},
    {label:'Medical plan choice', pts:gmcPick},
    {label:'Add-ons selected ('+Enrol.addons.length+')', pts:Enrol.addons.length*200},
    {label:'Term-life choice', pts:gtlBoost},
    {label:'Nominees added', pts:Enrol.nominees.length*150},
    {label:'Speed bonus', pts:Math.max(0, 1400 - Math.floor(G.timeSpent)*5)},
    {label:'Knocked out ('+G.deaths+')', pts:-G.deaths*350},
  ];
  const total=Math.max(0, parts.reduce((s,p)=>s+p.pts,0));
  const sCut = n>=4 ? 6200 : 5600;
  const aCut = n>=4 ? 4600 : 4100;
  const bCut = n>=4 ? 3200 : 2800;
  const grade= total>=sCut?'S' : total>=aCut?'A' : total>=bCut?'B' : 'C';
  return {parts, total, grade};
}

/* ---------- SUMMARY ---------- */
let famTimer=null;
let courtBgImg=null; // cached Home Secured mood plate
let summarySaveInFlight=false;
let summarySaveDone=false;
let summarySavePromise=null;

function loadCourtBg(){
  return new Promise(res=>{
    if(courtBgImg && courtBgImg.complete && courtBgImg.naturalWidth){ res(courtBgImg); return; }
    // Prefer authored public sprite, then SPRITE_DEFS frame, then fallback URL
    const authored = (Sprites.frames.bg_complete && Sprites.frames.bg_complete[0]) || null;
    if(authored){ courtBgImg=authored; res(authored); return; }
    const img=new Image();
    img.onload=()=>{ courtBgImg=img; res(img); };
    img.onerror=()=>res(null);
    img.src=assetPath('sprites/bg_complete.png?v=neem');
  });
}

function showSummary(){
  hideLevelResultsUI();
  const summaryUi=document.getElementById('summaryUI');
  if(summaryUi) summaryUi.classList.add('summaryEntering');
  G.state='summary'; hideScreens(); showScreen('summaryUI');
  syncCompanyBranding();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(summaryUi) summaryUi.classList.remove('summaryEntering');
  }));
  document.getElementById('hud').style.display='none';
  syncDemoBar();
  const sc=computeScore();
  const mem = coveredMembers().length
    ? coveredMembers()
    : allMembers().filter(m=>m.id==='self');
  const ch=Enrol.character;
  const body=document.getElementById('summaryBody');

  const heroMeta=[ch.gender, ch.age?ch.age+' yrs':null, ch.marital].filter(Boolean).join(' · ');
  const gmcLine = Enrol.gmc
    ? (Enrol.gmc.planName||'Plan')+' · '+siShort(Enrol.gmc.si)
    : null;
  body.innerHTML =
    '<div class="coScroll">'+
      '<h1>Course Clear!</h1>'+
      '<p class="checkoutLead">Nice run — here’s what you explored and selected.</p>'+
      '<div class="coHero">'+
        '<span class="nm">'+(ch.name||'Hero')+'</span>'+
        (heroMeta?'<span class="meta">'+heroMeta+'</span>':'')+
      '</div>'+
      '<div class="coRank">'+
        '<span class="coRankLabel">Your rank</span>'+
        '<span class="coRankGrade">'+sc.grade+'</span>'+
        '<span class="coRankPts">'+sc.total+' pts</span>'+
      '</div>'+
      '<div class="coSec coSecFamily">'+
        '<div class="coSecLabel">Covered family</div>'+
        '<div class="coChips">'+
          mem.map(m=>'<span class="coChip">'+(m.name||m.relation)+'<em>'+m.relation+'</em></span>').join('')+
        '</div>'+
      '</div>'+
      '<div class="coSec coSecBenefits">'+
        '<div class="coSecLabel">Selections</div>'+
        '<div class="coBenefits">'+
          '<div class="coBenefit'+(gmcLine?'':' miss')+'">'+
            '<span class="coBenefitKind">Medical</span>'+
            '<span class="coBenefitVal">'+(gmcLine||'Not chosen')+'</span>'+
          '</div>'+
          (Enrol.addons.length
            ? Enrol.addons.map(a=>'<div class="coBenefit">'+
                '<span class="coBenefitKind">'+a.name+'</span>'+
                '<span class="coBenefitVal">'+
                  (a.per==='family'?'Whole family':(a.memberNames||[]).join(', ')||'Selected')+
                '</span></div>').join('')
            : '<div class="coBenefit miss"><span class="coBenefitKind">Add-ons</span><span class="coBenefitVal">None</span></div>')+
        '</div>'+
      '</div>'+
      '<div class="coSec coSecNominees">'+
        '<div class="coSecLabel">Nominees</div>'+
        (Enrol.nominees.length
          ? Enrol.nominees.map(n=>'<div class="coRow"><span class="k">'+(n.name||'—')+'</span><span class="v">'+(n.relation||'')+' · '+(n.share||0)+'%</span></div>').join('')
          : '<div class="coRow"><span class="k">None yet</span><span class="v miss">—</span></div>')+
      '</div>'+
    '</div>'+
    '<div class="coFooter">'+
      '<div class="coActions">'+
        '<button class="pxbtn good" id="submitBtn">Finish game</button>'+
      '</div>'+
      '<p class="coNote" id="submitNote">'+
        'This is a practice run — you’ll still need to enrol on the actual enrolment portal to confirm anything. Hope you had fun playing and learning what’s on offer!'+
      '</p>'+
    '</div>';

  // Reset success beat if revisiting checkout
  const screen=document.getElementById('summaryUI');
  if(screen) screen.classList.remove('successFocus');
  body.classList.remove('exit');
  const successEl=document.getElementById('checkoutSuccess');
  if(successEl){ successEl.hidden=true; successEl.classList.remove('show'); }

  const cap=document.getElementById('courtCaption');
  if(cap) cap.textContent = mem.length>1
    ? 'Your party · '+mem.length+' together'
    : 'Your party';

  document.getElementById('submitBtn').onclick=()=>submitPlay({ noSuccessModal:false, uiFeedback:false });

  // Courtyard: mood plate + standing idle family
  startCourtyardScene(mem);
  summarySaveInFlight=false;
  summarySaveDone=false;
  summarySavePromise=null;
  submitPlay({ auto:true, noSuccessModal:true, uiFeedback:false });
}

let _courtResize = null;
async function startCourtyardScene(mem){
  clearInterval(famTimer); famTimer=null;
  if(_courtResize){ window.removeEventListener('resize', _courtResize); _courtResize=null; }
  const cv=document.getElementById('courtCv');
  if(!cv) return;
  const wrap=cv.parentElement;
  // Warm the mood plate into cache (CSS uses the same URL full-bleed)
  loadCourtBg();

  // Per-person: mostly stand idle; rare randomized gesture bursts
  // Mild foot stagger only — all names below feet with wider gaps so they don’t collide
  const clusterOff=[
    {dx:0, dy:0},
    {dx:4, dy:-5},
    {dx:-3, dy:4},
    {dx:5, dy:-3},
    {dx:-4, dy:3},
    {dx:3, dy:-4},
    {dx:-5, dy:2},
    {dx:4, dy:-2},
  ];
  const actors=mem.map((m,i)=>({
    m, i,
    mode:'stand', // stand | gesture
    standT:0,
    nextGestureAt: 35 + Math.floor(Math.random()*55) + i*12,
    gestureT:0,
    gestureLen:0,
    idlePhase: Math.floor(Math.random()*24),
    ox: clusterOff[i%clusterOff.length].dx,
    oy: clusterOff[i%clusterOff.length].dy,
  }));

  const paint=()=>{
    const cssW=Math.max(320, wrap.clientWidth|0);
    const cssH=Math.max(240, wrap.clientHeight|0);
    const dpr=Math.min(2, window.devicePixelRatio||1);
    if(cv.width!==Math.round(cssW*dpr) || cv.height!==Math.round(cssH*dpr)){
      cv.width=Math.round(cssW*dpr); cv.height=Math.round(cssH*dpr);
    }
    const x=cv.getContext('2d');
    x.setTransform(dpr,0,0,dpr,0,0);
    x.imageSmoothingEnabled=false;
    // Clear only — scenic mood is CSS full-bleed behind this canvas
    x.clearRect(0,0,cssW,cssH);
    return {x, cssW, cssH};
  };

  let ft=0;
  const tick=()=>{
    if(G.state!=='summary'){ clearInterval(famTimer); famTimer=null; return; }
    const {x, cssW, cssH}=paint();
    ft++;

    const groundY = cssH * 0.78;
    const n=Math.max(1, actors.length);
    const focused=document.getElementById('summaryUI')?.classList.contains('successFocus');
    // Enough horizontal space so name tags don’t collide; left-biased on success
    const maxGap=Math.min(focused?72:78, (cssW*(focused?0.34:0.38))/Math.max(1,n));
    const gap=Math.max(focused?54:58, maxGap);
    const lineW=(n-1)*gap;
    // Checkout: open courtyard right of card · Success: left-of-center beside big modal
    const startX = focused
      ? Math.max(cssW*0.08, cssW*0.28 - lineW/2)
      : Math.max(cssW*0.50, cssW*0.64 - lineW/2);
    const baseScale = Math.min(2.75, Math.max(1.48, cssH/245)) * (focused ? 1.05 : 1);

    // Draw back-to-front by ground Y so staggered feet read correctly
    const order=[...actors].sort((a,b)=> (a.oy-b.oy) || (a.i-b.i));
    order.forEach((a)=>{
      a.standT++;
      const frames=courtFramesFor(a.m);
      const nFr=frames ? frames.length : 6;
      const idleN=Math.min(3, Math.max(1, Math.ceil(nFr*0.4)));
      const gestN=Math.max(1, nFr-idleN);

      if(a.mode==='stand'){
        a.idlePhase++;
        if(a.standT >= a.nextGestureAt){
          a.mode='gesture';
          a.gestureT=0;
          a.gestureLen = gestN * 7; // ~hold each gesture frame
        }
      } else {
        a.gestureT++;
        if(a.gestureT >= a.gestureLen){
          a.mode='stand';
          a.standT=0;
          a.nextGestureAt = 50 + Math.floor(Math.random()*90); // ~5.5–15s
          a.idlePhase=Math.floor(Math.random()*idleN*18);
        }
      }

      let frame=0;
      let gesturing=a.mode==='gesture';
      if(frames){
        if(gesturing){
          const gi=Math.min(gestN-1, Math.floor(a.gestureT / 7));
          frame = idleN + gi;
        } else {
          // slow breathe through idle frames only
          frame = Math.floor(a.idlePhase / 20) % idleN;
        }
      }

      const sc=baseScale;
      const bob = (!gesturing && (Math.floor(a.idlePhase/20)%2===1)) ? 1 : 0;
      const cx=startX + a.i*gap + a.ox;
      const gy=groundY + a.oy - bob;
      const used=drawCourtMember(x, cx, gy, a.m, frame, sc);
      if(!used){
        const skin=a.m.id==='self'?SKINS[Enrol.character.skin??2]:SKINS[(a.i*2+1)%5];
        drawCourtMini(x, cx, gy, skin, a.m, sc*familyFrontScale(a.m), gesturing);
      }
      const label=(a.m.name||a.m.relation||'?').split(' ')[0].slice(0,10);
      x.font='600 13px Fredoka, system-ui, sans-serif';
      x.textAlign='center';
      const tw=x.measureText(label).width+12;
      // Keep tags under feet; tiny alternating nudge so neighbors don’t stack
      const lx = cx + ((a.i%2===0)?-6:6);
      const ly = gy + 10;
      x.fillStyle='rgba(61,34,16,.88)';
      x.fillRect(lx-tw/2, ly, tw, 18);
      x.strokeStyle='#f0d090'; x.lineWidth=1; x.strokeRect(lx-tw/2+0.5, ly+0.5, tw-1, 17);
      x.fillStyle='#fff8e8';
      x.fillText(label, lx, ly+13);
    });
  };

  requestAnimationFrame(()=>{ tick(); famTimer=setInterval(tick, 110); });
  _courtResize=()=>{ if(G.state==='summary') tick(); };
  window.addEventListener('resize', _courtResize);
}

/** Resolve front strip frames for a covered member. */
function courtFramesFor(m){
  if(m.id==='self'){
    const g=Enrol.character && Enrol.character.gender;
    const pack=g && Sprites.genderPacks[g] && Sprites.genderPacks[g].base;
    if(pack && pack.hero_front && pack.hero_front.length) return pack.hero_front;
    if(Sprites.frames.hero_front && Sprites.frames.hero_front.length) return Sprites.frames.hero_front;
  }
  return Sprites.familyFramesFor(m.relation, m.gender);
}

/** Draw one courtyard frame; false → procedural mini. */
function drawCourtMember(x,cx,gy,m,frame,s){
  const arr=courtFramesFor(m);
  if(!arr || !arr.length) return false;
  const fr=arr[Math.max(0, Math.min(arr.length-1, frame|0))];
  if(!fr) return false;
  const hero = (m.id==='self');
  // Normalize 96px hero cells against 64px family cells, then apply relation hierarchy.
  const mul = hero ? 0.6 : 0.9*familyFrontScale(m);
  const dw=fr.width*s*mul, dh=fr.height*s*mul;
  x.drawImage(fr, cx-dw/2, gy-dh, dw, dh);
  return true;
}

function drawCourtMini(x,cx,gy,skin,m,s,gesturing){
  const h=48*s, top=gy-h;
  const shirt=m.gender==='female'?'#e0559a':m.relation==='parent'?'#7a6f4a':(m.gender==='other'?'#3fbf8f':'#4a6cd4');
  x.fillStyle='rgba(20,10,5,.28)';
  x.beginPath(); x.ellipse(cx, gy-2, 14*s, 4*s, 0, 0, 7); x.fill();
  x.fillStyle='#2b2b3d'; x.fillRect(cx-7*s,top+32*s,6*s,16*s); x.fillRect(cx+1*s,top+32*s,6*s,16*s);
  x.fillStyle=shirt; x.fillRect(cx-10*s,top+16*s,20*s,17*s);
  x.fillStyle=skin; x.fillRect(cx-9*s,top,18*s,16*s);
  x.fillStyle=(m.relation==='parent')?'#cfcfcf':'#241a12'; x.fillRect(cx-10*s,top-2*s,20*s,5*s);
  if(m.gender==='female'){ x.fillRect(cx-11*s,top+2*s,3*s,10*s); x.fillRect(cx+8*s,top+2*s,3*s,10*s); }
  // wink during gesture peak
  const wink = gesturing && (Math.floor(Date.now()/120)%4===0);
  x.fillStyle='#101018';
  x.fillRect(cx-4*s,top+6*s,2*s,2*s);
  if(wink) x.fillRect(cx+2*s,top+7*s,2*s,1*s);
  else x.fillRect(cx+2*s,top+6*s,2*s,2*s);
  x.fillStyle=skin;
  if(gesturing){ x.fillRect(cx+10*s, top+2*s, 4*s, 14*s); } // wave
  else { x.fillRect(cx+10*s, top+16*s, 4*s, 14*s); }
  x.fillRect(cx-14*s, top+16*s, 4*s, 14*s);
}

async function submitPlay(opts={}){
  const { auto=false, noSuccessModal=true, uiFeedback=true } = opts;
  if(summarySaveDone){
    if(!noSuccessModal){
      enterCheckoutSuccess();
    }
    return;
  }
  if(summarySaveInFlight){
    // The silent auto-save fired by showSummary() may still be in flight —
    // wait for it instead of dropping this call, so a "Finish game" click
    // during that window still opens the success modal (and its "Back to
    // title" button) once the save resolves, rather than doing nothing.
    if(summarySavePromise) await summarySavePromise;
    if(summarySaveDone && !noSuccessModal){
      setTimeout(enterCheckoutSuccess, 550);
    }
    return;
  }
  const btn=document.getElementById('submitBtn');
  if(!auto && uiFeedback && btn){ btn.disabled=true; btn.textContent='Saving…'; }
  summarySaveInFlight=true;
  const sc=computeScore();
  const session=getPlayerSession();
  const payload={
    id:SESSION_ID, ts:new Date().toISOString(), mode:CONFIG.MODE,
    player: session ? { fullName: session.fullName, department: session.department, notEmployee: session.notEmployee } : null,
    character:Enrol.character, dependants:Enrol.dependants, covered:Enrol.covered,
    coveredNames:coveredMembers().map(m=>m.name),
    gmc:Enrol.gmc, addons:Enrol.addons.map(a=>({id:a.id,name:a.name,per:a.per,members:a.memberNames,cost:a.cost})),
    gtl:Enrol.gtl, superTopUp:Enrol.superTopUp, nominees:Enrol.nominees,
    totalPremium:totalPremium(), score:sc.total, grade:sc.grade,
    coins:G.coinsGot, stomps:G.stomps, deaths:G.deaths,
    durationSec:Math.round(G.timeSpent),
  };
  summarySavePromise = (async()=>{
    try{
      if(CONFIG.MODE==='live'){ await submitEnrolmentToAPI(payload); }
      const result = await persistInterestPlay(payload);
      if(!result.ok){
        if(!auto && uiFeedback){
          if(btn){ btn.disabled=false; btn.textContent='Retry'; }
          const note=document.getElementById('submitNote');
          if(note) note.innerHTML='<span class="no">'+result.message+'</span>';
        }
        return;
      }
      summarySaveDone=true;
      if(!auto && uiFeedback && btn){
        btn.disabled=false;
        btn.textContent = 'Done!';
      }
      if(!auto && uiFeedback){
        const note=document.getElementById('submitNote');
        if(note){
          note.innerHTML='<span class="ok">'+(result.skipped?'Interest noted — next up, the portal.':'Saved — next up, the portal.')+'</span>';
        }
      }
    }catch(e){
      if(!auto && uiFeedback){
        if(btn){ btn.disabled=false; btn.textContent='Retry'; }
        const note=document.getElementById('submitNote');
        if(note) note.innerHTML='<span class="no">Save failed — try again.</span>';
      }
    }finally{
      summarySaveInFlight=false;
    }
  })();
  await summarySavePromise;
  if(!noSuccessModal && summarySaveDone){
    setTimeout(enterCheckoutSuccess, 550);
  }
}

/** Card slides away; camera eases onto the family; portal QR message appears. */
function enterCheckoutSuccess(){
  if(G.state!=='summary') return;
  const screen=document.getElementById('summaryUI');
  const card=document.getElementById('summaryBody');
  const success=document.getElementById('checkoutSuccess');
  if(card) card.classList.add('exit');
  if(screen) screen.classList.add('successFocus');
  if(success){
    success.hidden=false;
    // next frame so CSS transition can run from opacity 0
    requestAnimationFrame(()=>{ success.classList.add('show'); });
  }
  const restartBtn=document.getElementById('successRestartBtn');
  if(restartBtn) restartBtn.onclick=()=>{
    clearInterval(famTimer); famTimer=null; startGame();
  };
  const titleBtn=document.getElementById('successTitleBtn');
  if(titleBtn) titleBtn.onclick=()=>{
    clearInterval(famTimer); famTimer=null; showTitle();
  };
}

/* ---------- SPRITE STUDIO ---------- */
function showStudio(){
  G.state='studio'; hideScreens(); showScreen('studioUI');
  const list=document.getElementById('spriteList'); list.innerHTML='';
  let lastGroup='';
  for(const key of Object.keys(SPRITE_DEFS)){
    const d=SPRITE_DEFS[key];
    if(d.group!==lastGroup){
      lastGroup=d.group;
      const h=document.createElement('h2');
      h.textContent=d.group; h.className='spriteGroupTitle';
      list.appendChild(h);
    }
    const card=document.createElement('div'); card.className='spriteCard';
    const pv=document.createElement('canvas');
    const ps=Math.min(3, Math.max(1, Math.floor(192/Math.max(d.w,d.h))));
    pv.width=d.w*ps; pv.height=d.h*ps; pv.style.width=(d.w*ps)+'px';
    card.appendChild(pv);
    const info=document.createElement('div'); info.className='info';
    const sheetW=d.w*d.frames;
    info.innerHTML='<div class="nm">'+d.label+'</div>'+
      '<div class="hint">Upload: PNG, <b>'+sheetW+'×'+d.h+'px</b>'+
      (d.frames>1?' — '+d.frames+' frames of '+d.w+'×'+d.h+', left→right':' (single image)')+
      '. Transparent background recommended.</div>'+
      (Sprites.custom[key]?'<div class="custom">● Sprite Studio upload</div>':Sprites.authored[key]?'<div class="custom">● authored PNG from /sprites</div>':'<div class="muted" style="font-size:12px;">default pixel art</div>');
    card.appendChild(info);
    const acts=document.createElement('div'); acts.style.cssText='display:flex; gap:8px;';
    const up=document.createElement('label'); up.className='pxbtn small filebtn'; up.textContent='Upload PNG';
    const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*';
    inp.onchange=()=>{
      const f=inp.files[0]; if(!f) return;
      const r=new FileReader();
      r.onload=async ()=>{ const ok=await Sprites.applyDataURL(key, r.result);
        toast(ok?d.label+' updated!':'Could not read that image'); showStudio(); };
      r.readAsDataURL(f);
    };
    up.appendChild(inp);
    const rs=document.createElement('button'); rs.className='pxbtn small warn'; rs.textContent='Reset';
    rs.onclick=async ()=>{ await Sprites.reset(key); toast(d.label+' reset to default'); showStudio(); };
    acts.appendChild(up); acts.appendChild(rs);
    card.appendChild(acts);
    list.appendChild(card);
    // animate preview
    let f=0;
    (function anim(){
      if(document.getElementById('studioUI').style.display==='none') return;
      const x=pv.getContext('2d'); x.clearRect(0,0,pv.width,pv.height); x.imageSmoothingEnabled=false;
      const fr=Sprites.frames[key][f%d.frames];
      x.drawImage(fr,0,0,d.w,d.h,0,0,d.w*ps,d.h*ps);
      f++; setTimeout(anim, 160);
    })();
  }
}

/* ---------- DATA VIEW ---------- */
function showData(){
  G.state='data'; hideScreens(); showScreen('dataUI'); refreshData();
  const note=document.getElementById('cloudExportNote');
  if(note) note.textContent = cloudExportGuidance()+' Active company: '+CONFIG.COMPANY+'.';
  const jsonBtn=document.getElementById('cloudExportJson');
  const csvBtn=document.getElementById('cloudExportCsv');
  if(!note || !jsonBtn || !csvBtn) return;
  const ready=exportEndpointReady();
  jsonBtn.disabled=!ready; csvBtn.disabled=!ready;
  const runCloud=async (format)=>{
    const secret=(document.getElementById('adminSecret')||{}).value||'';
    note.textContent='Exporting…';
    const r=await fetchCloudPlays(secret, format);
    if(!r.ok){ note.innerHTML='<span class="no">'+r.message+'</span>'; toast('Cloud export failed'); return; }
    const out=document.getElementById('dataOut');
    out.style.display='block'; out.value=r.text;
    note.innerHTML='<span class="ok">Cloud '+format.toUpperCase()+' ready for '+CONFIG.COMPANY+' — '+(r.text.split('\n').length)+' lines.</span>';
    if(navigator.clipboard) navigator.clipboard.writeText(r.text).then(()=>toast('Cloud '+format+' copied!')).catch(()=>{});
  };
  jsonBtn.onclick=()=>runCloud('json');
  csvBtn.onclick=()=>runCloud('csv');
}
let dataCache=[];
function normalizePlayRow(raw){
  // local persistInterestPlay shape vs legacy payload shape
  if(raw && raw.payload){
    const p=raw.payload;
    return {
      ts: raw.created_at || p.ts,
      mode: raw.mode || p.mode,
      id: p.id,
      character: p.character,
      coveredNames: p.coveredNames,
      coveredCount: p.coveredCount ?? (Array.isArray(p.coveredNames) ? p.coveredNames.length : undefined),
      gmc: p.gmc,
      addons: p.addons,
      gtl: p.gtl,
      nominees: p.nominees,
      totalPremium: p.totalPremium,
      score: raw.score ?? p.score,
      grade: raw.grade ?? p.grade,
      durationSec: raw.duration_sec ?? p.durationSec,
      company_id: raw.company_id || p.company_id || 'tarento',
      playerName: raw.full_name || p.player?.fullName,
      department: raw.department || p.player?.department,
      synced: !!raw.synced,
    };
  }
  return {
    ...raw,
    company_id: raw.company_id || 'tarento',
    playerName: raw.player?.fullName || raw.character?.name,
    department: raw.player?.department || '',
  };
}
function rowBelongsToActiveCompany(row){
  const rowCompany=(row && row.company_id) ? String(row.company_id) : 'tarento';
  return rowCompany===CONFIG.activeCompanyId;
}
async function refreshData(){
  const wrap=document.getElementById('dataTableWrap');
  wrap.innerHTML='<p class="muted" style="margin-top:20px;">Loading…</p>';
  const rows=[];
  // Legacy sprite/play keys still in localStorage Store
  const r=await Store.list('play:', true);
  for(const k of (r.keys||[])){
    try{ const rec=await Store.get(k, true); if(rec) rows.push(normalizePlayRow(JSON.parse(rec.value))); }catch(e){}
  }
  // New persistInterestPlay keys
  for(const raw of listLocalPlays()){
    try{
      const row=normalizePlayRow(raw);
      if(rowBelongsToActiveCompany(row)) rows.push(row);
    }catch(e){}
  }
  // de-dupe by id/ts
  const seen=new Set();
  const uniq=[];
  for(const p of rows){
    const key=String(p.id||'')+'|'+(p.ts||'');
    if(seen.has(key)) continue;
    seen.add(key); uniq.push(p);
  }
  uniq.sort((a,b)=> String(b.ts||'').localeCompare(String(a.ts||'')));
  dataCache=uniq;
  if(!uniq.length){ wrap.innerHTML='<p class="muted" style="margin-top:20px;">No employee plays saved yet. Finish a run (without “not an employee”) and submit on the summary screen.</p>'; return; }
  let html='<table class="data"><tr><th>When</th><th>Synced</th><th>Name</th><th>Dept</th><th>Hero</th><th>Covered</th><th>Medical</th><th>Add-ons</th><th>Term life</th><th>Premium</th><th>Score</th></tr>';
  for(const p of uniq){
    html+='<tr><td>'+new Date(p.ts).toLocaleString()+'</td>'+
      '<td>'+(p.synced?'<span class="ok">cloud</span>':'<span class="gd">local</span>')+'</td>'+
      '<td>'+(p.playerName||'—')+'</td><td>'+(p.department||'—')+'</td>'+
      '<td>'+(p.character?.name||'—')+'</td>'+
      '<td>'+(Array.isArray(p.coveredNames)&&p.coveredNames.length?p.coveredNames.join(', '):(p.coveredCount!=null?String(p.coveredCount)+' covered':'—'))+'</td>'+
      '<td>'+(p.gmc?p.gmc.planName+'<br><span class="muted">'+fmtINR(p.gmc.si)+'</span>':'—')+'</td>'+
      '<td>'+((p.addons||[]).map(a=>a.name).join(', ')||'—')+'</td>'+
      '<td>'+(p.gtl?p.gtl.name:'—')+'</td>'+
      '<td>'+fmtINR(p.totalPremium)+'</td><td>'+p.score+' ('+p.grade+')</td></tr>';
  }
  html+='</table>';
  wrap.innerHTML=html;
}
function exportData(kind){
  const out=document.getElementById('dataOut');
  let text='';
  if(kind==='json') text=JSON.stringify(dataCache, null, 2);
  else{
    const cols=['ts','playerName','department','id','hero','gender','age','coveredNames','gmcPlan','gmcSI','addons','gtl','nominees','totalPremium','score','grade','durationSec'];
    text=cols.join(',')+'\n';
    for(const p of dataCache){
      const row=[p.ts,p.playerName,p.department,p.id,p.character?.name,p.character?.gender,p.character?.age,
        (p.coveredNames||[]).join('; '), p.gmc?.planName||'', p.gmc?.si||'',
        (p.addons||[]).map(a=>a.name).join('; '), p.gtl?.name||'',
        (p.nominees||[]).map(n=>n.name+' '+n.share+'%').join('; '), p.totalPremium, p.score, p.grade, p.durationSec];
      text+=row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')+'\n';
    }
  }
  out.style.display='block'; out.value=text;
  if(navigator.clipboard){ navigator.clipboard.writeText(text).then(()=>toast('Copied to clipboard!')).catch(()=>toast('Select the text box below and copy manually')); }
  else toast('Select the text box below and copy manually');
}

/*═══════════════════════════════════════════════════════════════════
  9) BOOT
═══════════════════════════════════════════════════════════════════*/
async function boot(){
  const bar=document.getElementById('loadBar'), msg=document.getElementById('loadMsg');
  const step=(p,t)=>{bar.style.width=p+'%'; msg.textContent=t;};
  step(3,'LOADING COMPANY…');
  await loadCompanyPref();
  step(7,'LOADING ADMIN PREFS…');
  await loadLevel4Pref();
  step(10,'DRAWING PIXELS…');
  for(const key of Object.keys(SPRITE_DEFS)) Sprites.buildDefault(key);

  step(16,'READING SPRITE LIST…');
  const manifest = await loadSpriteManifest();
  const titleKeys = filterManifest(manifest, BOOT_TITLE_KEYS);
  const playKeys = filterManifest(manifest, BOOT_PLAY_KEYS);
  const deferKeys = filterManifest(manifest, BOOT_DEFER_KEYS);

  step(22,'LOADING TITLE…');
  // Enough to paint the home screen — heroes + title sky in parallel
  await Promise.all([
    Sprites.loadAuthoredKeys(titleKeys),
    Sprites.loadGenderPacks(),
    Sprites.loadFamilyPacks(),
  ]);
  step(55,'STUDIO UPLOADS…');
  await Sprites.loadCustomAll();
  Sprites.rebuildHero();

  // Kick L1 pack in the background; Start waits if the player is very fast
  _playAssetsReady = false;
  _playAssetsPromise = Sprites.loadAuthoredKeys(playKeys).then((loaded)=>{
    _playAssetsReady = true;
    if(loaded.length) console.info('[sprites] play pack:', loaded.join(', '));
    return loaded;
  });
  _deferAssetsPromise = _playAssetsPromise.then(()=>
    Sprites.loadAuthoredKeys(deferKeys).then((loaded)=>{
      if(loaded.length) console.info('[sprites] deferred pack:', loaded.join(', '));
      return loaded;
    }),
  );

  step(100,'READY!');
  setTimeout(()=>{
    document.getElementById('loading').style.display='none';
    showTitle();
  },120);
  loop();
}

// scale canvas to fit window
function fit(){
  const s=Math.min(innerWidth/W, innerHeight/H, 1.4);
  cv.style.width=(W*s)+'px'; cv.style.height=(H*s)+'px';
  document.getElementById('wrap').style.width=(W*s)+'px';
  document.getElementById('wrap').style.height=(H*s)+'px';
}
addEventListener('resize', fit); fit();
boot();

window.G = G;
window.showSummary = showSummary;
window.Enrol = Enrol;
window.Sprites = Sprites;


document.addEventListener('click', (e)=>{
  const el = e.target.closest('[data-action]');
  if(!el) return;
  const act = el.getAttribute('data-action');
  const arg = el.getAttribute('data-arg');
  if(act==='showTitle') showTitle();
  else if(act==='refreshData') refreshData();
  else if(act==='exportData') exportData(arg||'json');
});

export {
  boot, showTitle, showSetup, showStudio, showSummary, refreshData, exportData,
  CONFIG, SPRITE_DEFS, SCALE, TILE, W, H
};
