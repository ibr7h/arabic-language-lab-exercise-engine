import assert from 'node:assert/strict';
import { BoardState, saveBoardState, loadBoardState } from '../assets/js/core/board-state.js';
const state=new BoardState([{id:'a',type:'letter',x:1,y:2,scale:1}]);
const storage={data:new Map(),setItem(k,v){this.data.set(k,v)},getItem(k){return this.data.get(k)||null}};
assert.equal(saveBoardState(storage,'k',state,{mode:'free'}),true);
const loaded=loadBoardState(storage,'k');
assert.equal(loaded.items[0].id,'a'); assert.equal(loaded.meta.mode,'free');
loaded.items[0].x=99; assert.equal(state.items[0].x,1);
console.log('Board state persistence tests: OK');
