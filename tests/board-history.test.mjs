import assert from 'node:assert/strict';
import { BoardHistory } from '../assets/js/core/board-history.js';
const h=new BoardHistory(3); let current=[{id:'a',x:1}];
h.checkpoint(current,'move'); current=[{id:'a',x:2}];
let prev=h.undo(current); assert.equal(prev[0].x,1); assert.equal(h.canRedo,true);
let next=h.redo(prev); assert.equal(next[0].x,2);
console.log('Board history tests: OK');
