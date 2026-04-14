/*
 * Copyright (C) 2026 SiGear
 * This file is part of the SiGear project.
 * SiGear is distributed under the terms of the GNU Affero General Public License v3.0.
 * See the project LICENSE-AGPLv3.txt for details.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

async function hmacHex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const b = new Uint8Array(sig);
  return Array.from(b).map(x => x.toString(16).padStart(2,'0')).join('');
}

function el(id){return document.getElementById(id)}

el('registerBtn').addEventListener('click', async ()=>{
  const server = el('server').value.replace(/\/$/, '')
  const id = el('deviceId').value
  const ts = Math.floor(Date.now()/1000)
  const secret = el('bootstrap').value
  el('regResult').innerText = 'Computing signature...'
  const msg = `${id}|${ts}`
  const sig = await hmacHex(secret, msg)
  el('regResult').innerText = 'Registering...'
  try{
    const res = await fetch(`${server}/api/register`, {method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({id,ts,sig})})
    const j = await res.json()
    el('regResult').innerText = JSON.stringify(j)
    if(j.api_key) el('apiKey').value = j.api_key
  }catch(e){el('regResult').innerText = e}
})

let connInterval = null
el('connectBtn').addEventListener('click', ()=>{
  const server = el('server').value.replace(/\/$/, '')
  const apiKey = el('apiKey').value
  if(!apiKey){alert('api_key required');return}
  el('connStatus').innerText = 'Connected (simulating VPN)'
  el('connectBtn').disabled = true
  el('disconnectBtn').disabled = false
  // periodic keepalive and a DNS check
  connInterval = setInterval(async ()=>{
    try{
      // send keepalive as SOS (mock)
      await fetch(`${server}/api/sos`,{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':apiKey},body:JSON.stringify({device:el('deviceId').value, t:Date.now()})})
      // vpn keepalive if provisioned
      const cfg = window.__si_vpn_cfg
      if(cfg && cfg.session_id){
        await fetch(`${server}/api/vpn/keepalive`,{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':apiKey},body:JSON.stringify({session_id:cfg.session_id})})
      }
    }catch(e){console.log('keepalive failed',e)}
  }, 5000)
})
el('disconnectBtn').addEventListener('click', ()=>{
  clearInterval(connInterval)
  connInterval = null
  el('connStatus').innerText = 'Disconnected'
  el('connectBtn').disabled = false
  el('disconnectBtn').disabled = true
})

el('dnsCheckBtn').addEventListener('click', async ()=>{
  const server = el('server').value.replace(/\/$/, '')
  const domain = el('domain').value
  const id = el('deviceId').value
  const res = await fetch(`${server}/api/check_domain?domain=${encodeURIComponent(domain)}&device_id=${encodeURIComponent(id)}`)
  const j = await res.json()
  el('dnsResult').innerText = JSON.stringify(j)
})

el('updateDeviceBtn').addEventListener('click', async ()=>{
  const server = el('server').value.replace(/\/$/, '')
  const apiKey = el('apiKey').value
  const id = el('deviceId').value
  const blocked = el('blocked').value.split(',').map(s=>s.trim()).filter(Boolean)
  const payload = {id, name:id, blocked_domains: blocked, allowed_domains: []}
  try{
    const res = await fetch(`${server}/api/devices`, {method:'POST', headers:{'Content-Type':'application/json','X-API-Key':apiKey}, body: JSON.stringify(payload)})
    const j = await res.json()
    el('updateResult').innerText = JSON.stringify(j)
  }catch(e){el('updateResult').innerText = e}
})

el('provisionVpnBtn').addEventListener('click', async ()=>{
  const server = el('server').value.replace(/\/$/, '')
  const apiKey = el('apiKey').value
  if(!apiKey){alert('api_key required');return}
  const id = el('deviceId').value
  try{
    const res = await fetch(`${server}/api/vpn/provision`,{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':apiKey},body:JSON.stringify({device_id:id})})
    const j = await res.json()
    if(j.status === 'ok'){
      window.__si_vpn_cfg = j.config
      el('vpnConfig').innerText = JSON.stringify(j.config,null,2)
      alert('VPN provisioned (mock)')
    }else{
      el('vpnConfig').innerText = JSON.stringify(j)
    }
  }catch(e){el('vpnConfig').innerText = e}
})
