/*Bernkastel*/
/*Credits Pinky for base code*/

const CONTRACT_DRESSING_ROOM = 76

module.exports = function zCostumeEx(dispatch) {
	const Scanner = require('./scanner')
	Scanner(dispatch)
	
	let checkz = false;
	let player;
	let inDye = false;
	let userDefaultAppearance;

	let db = Scanner.db,
		cid = null,
		external = null,
		inDressup = false,
		lastTooltip = 0,
		lastTooltipTime = 0
		
////////////////////////////////////////

const path = require('path');
fs = require('fs');

let presets = {};
let presetTimeout = null;
let presetLock = false;	

try { presets = require('./presets.json'); }
catch(e) { presets = {}; }

function presetUpdate() {
	clearTimeout(presetTimeout);
	presetTimeout = setTimeout(presetSave, 1000);
}

function presetSave() {
	if(presetLock) {
		presetUpdate();
		return;
	}

	presetLock = true;
	fs.writeFile(path.join(__dirname, 'presets.json'), JSON.stringify(presets), err => {
		presetLock = false;
	});
}

////////////////////////////////////////

	dispatch.hook('S_LOGIN', 1, event => {
		({cid} = event)
		player = event.name;
		inDressup = false
		inDye = false;
		if(presets[player] && presets[player].id != 0){
			external = presets[player];
			external.id = cid;
		}
	})
	
	dispatch.hook('S_GET_USER_LIST', 2, (event) => {
        for (let index in event.characters) {
            if(presets[event.characters[index].name] && presets[event.characters[index].name].id != 0){
                event.characters[index].face = presets[event.characters[index].name].face;
				event.characters[index].hairAdornment = presets[event.characters[index].name].hairAdornment;
				event.characters[index].mask = presets[event.characters[index].name].mask;
				event.characters[index].back = presets[event.characters[index].name].back;
				event.characters[index].weaponSkin = presets[event.characters[index].name].weaponSkin;
				event.characters[index].weaponEnchant = presets[event.characters[index].name].weaponEnchant;
				event.characters[index].costume = presets[event.characters[index].name].costume;
				event.characters[index].costumeDye = presets[event.characters[index].name].costumeDye;
            }
        }
        return true;
    });

	dispatch.hook('S_USER_EXTERNAL_CHANGE', 1, event => {
		if(event.id.equals(cid)) {
				userDefaultAppearance = Object.assign({}, event);
		if(presets[player] && presets[player].id != 0){
			dispatch.toClient('S_USER_EXTERNAL_CHANGE', 1, external);
			presets[player] = external;
			presetUpdate();
			if(external.enable == 0){
			dispatch.toClient('S_ABNORMALITY_BEGIN', 2, {
				target: cid,
				source: cid,
				id: 7777008,
				duration: 864000000,
				unk: 0,
				stacks: 1,
				unk2: 0,
			});
			}
			return false;
		}
		else{
			external = Object.assign({}, event);
			presets[player] = Object.assign({}, external);
			presets[player].id = 0;
			presetUpdate();
		}
		}
	})
	
	dispatch.hook('S_ABNORMALITY_BEGIN', 2, (event) => {
		if(presets[player] && presets[player].id != 0 && external.enable == 1 && event.id == 7777008){
			setTimeout(function(){
			dispatch.toClient('S_ABNORMALITY_END', 1, {
				target: cid,
				id: 7777008,
			});}, 1000);
		}
	});
	
	 // disable Marrow Brooch apearance change - Credits Kourinn
    dispatch.hook('S_UNICAST_TRANSFORM_DATA', 'raw', (code, data) => {
        return false
    })
	
	dispatch.hook('cChat', 1, (event) => {
		if(event.message.includes("dyecommand")){
			var str = event.message;
			str = str.replace("<FONT>", "");
			str = str.replace("</FONT>", "");
			str = str.split(" ");
			let z_hex = Math.min(Math.max(Number(str[4]),1),255).toString(16);
			let r_hex = Math.min(Math.max(Number(str[1]),16),255).toString(16);
			let g_hex = Math.min(Math.max(Number(str[2]),16),255).toString(16);
			let b_hex = Math.min(Math.max(Number(str[3]),16),255).toString(16);
			var color = Number('0x'+z_hex+r_hex+g_hex+b_hex);
			external.costumeDye = color;
			dispatch.toClient('S_USER_EXTERNAL_CHANGE', 1, external);
			presets[player] = external;
			presetUpdate();
			return false;
		}
		if(event.message.includes("weapon1")){
			var str = event.message;
			str = str.replace("<FONT>", "");
			str = str.replace("</FONT>", "");
			str = str.split(" ");
			external.weaponEnchant = str[1];
			dispatch.toClient('S_USER_EXTERNAL_CHANGE', 1, external);
			presets[player] = external;
			presetUpdate();
			return false;
		}
		if(event.message.includes("undye1")){
			external.costumeDye = 0;
			presets[player] = external;
			presetUpdate();
			dispatch.toClient('S_USER_EXTERNAL_CHANGE', 1, external);
			return false;
		}
		if(event.message.includes("dye1")){
			dispatch.toClient('S_REQUEST_CONTRACT', 1, {
				senderId: cid,
				recipientId: 0,
				type: 42,
				id: 999999,
				unk3: 0,
				time: 0,
				senderName: player,
				recipientName: '',
				data: '',});
			dispatch.toClient('S_ITEM_COLORING_BAG', 1, {
				unk: 40,
				unk1: 593153247,
				unk2: 0,
				item: external.costume,
				unk3: 0,
				dye: 169087,
				unk4: 0,
			unk5: 0,});
			return false;
		}
		if(event.message.includes("undies1")){
			if(external.enable == 1){
			dispatch.toClient('S_ABNORMALITY_BEGIN', 2, {
				target: cid,
				source: cid,
				id: 7777008,
				duration: 864000000,
				unk: 0,
				stacks: 1,
				unk2: 0,
			});
			external.enable = 0;
			presets[player] = external;
			presetUpdate();
			}
			else if(external.enable == 0){
			dispatch.toClient('S_ABNORMALITY_END', 1, {
				target: cid,
				id: 7777008,
			});
			external.enable = 1;
			presets[player] = external;
			presetUpdate();
			}
			return false;
		}
		if(event.message.includes("reset1")){
			dispatch.toClient('S_USER_EXTERNAL_CHANGE', 1, userDefaultAppearance);
			external = Object.assign({}, userDefaultAppearance);
			presets[player].id = 0;
			presetUpdate();
			return false;
		}
	});
	
	dispatch.hook('C_ITEM_COLORING_SET_COLOR', 1, (event) => {
		var color = Number('0x'+event.alpha.toString(16)+event.red.toString(16)+event.green.toString(16)+event.blue.toString(16));
		external.costumeDye = color;
		presets[player] = external;
		presetUpdate();
		inDye = true;
	});
	
	dispatch.hook('S_REQUEST_CONTRACT', 1, event => {
		if(event.type == CONTRACT_DRESSING_ROOM) {
			inDressup = true

			let items = []

			for(let slot in db)
				for(let item of db[slot])
					items.push({
						unk: 0,
						item
					})

			dispatch.toClient('S_REQUEST_INGAMESTORE_MARK_PRODUCTLIST', 1, {items})
		}
	})
	
	dispatch.hook('C_CANCEL_CONTRACT', 1, event => {
		if(inDye){
			inDye = false;
			dispatch.toClient('S_USER_EXTERNAL_CHANGE', 1, external);
			presets[player] = external;
			presetUpdate();
		}
	});

	dispatch.hook('S_CANCEL_CONTRACT', 1, event => {
		if(inDressup) {
			inDressup = false
			process.nextTick(() => { dispatch.toClient('S_USER_EXTERNAL_CHANGE', 1, external) })
			presets[player] = external;
			presetUpdate();
		}
	})

	dispatch.hook('S_REQUEST_INGAMESTORE_MARK_PRODUCTLIST', 1, function(){return false;})

	dispatch.hook('C_REQUEST_NONDB_ITEM_INFO', 1, event => {
		if(inDressup) {
			let time = Date.now()

			// The only way to tell an item was clicked in the Dressing Room is to watch for this packet twice in a row.
			// Unequipping is impossible to detect, unfortunately.
			if(lastTooltip == (lastTooltip = event.item) && time - lastTooltipTime < 10) equipped(event.item)

			lastTooltipTime = time

			dispatch.toClient('S_REPLY_NONDB_ITEM_INFO', 1, {
				item: event.item,
				unk: 0
			})
			return false
		}
	})

	function equipped(item) {
		external.id = cid;
		presets[player] = external;
		presetUpdate();
		for(let slot in db)
			if(db[slot].includes(item)) {
				external[slot] = item
				break
			}
	}
}