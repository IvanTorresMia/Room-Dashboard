// Pass the generated room key through stdin; never put it in arguments or Git.
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const directory = path.dirname(fileURLToPath(import.meta.url));
const {key} = JSON.parse(fs.readFileSync(path.join(directory,'.pairing.json'),'utf8'));
if(!/^[a-f0-9]{64}$/.test(key))throw Error('Invalid local room key');
const child=spawn(process.execPath,[path.join(directory,'node_modules/wrangler/bin/wrangler.js'),'secret','put','ROOM_KEY','--config',path.join(directory,'wrangler.json')],{cwd:directory,env:{...process.env,PATH:path.dirname(process.execPath)+':'+process.env.PATH},stdio:['pipe','inherit','inherit']});
child.stdin.end(key+'\n');
child.on('exit',code=>{process.exitCode=code || 0;});
