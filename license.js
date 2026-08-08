// HAVYCO V4 - Verificación de licencias offline con ECDSA P-256.
// Solo contiene la CLAVE PÚBLICA. Nunca publiques PRIVATE_KEY_HAVYCO_V4.pem.
(function(){
  const PUBLIC_JWK={"kty":"EC","crv":"P-256","x":"zTovosmfqLbxT_zR4AXiY48Rzrsr5_iH6DXm3mCD0-I","y":"hgrjTamE6uHRu7OIGADgnW9oQy3TB-i_tKuMO5bK8rQ","ext":true,"key_ops":["verify"]};
  function b64uToBytes(s){
    s=s.replace(/-/g,'+').replace(/_/g,'/');
    while(s.length%4)s+='=';
    const raw=atob(s); return Uint8Array.from(raw,c=>c.charCodeAt(0));
  }
  function bytesToText(bytes){return new TextDecoder().decode(bytes)}
  async function importKey(){return crypto.subtle.importKey('jwk',PUBLIC_JWK,{name:'ECDSA',namedCurve:'P-256'},false,['verify'])}
  async function verify(code){
    try{
      const clean=String(code||'').replace(/\s+/g,'').trim();
      const parts=clean.split('.');
      if(parts.length!==3||parts[0]!=='HV4')throw new Error('Formato de licencia inválido');
      const payloadBytes=b64uToBytes(parts[1]);
      const signature=b64uToBytes(parts[2]);
      if(signature.length!==64)throw new Error('Firma inválida. Copia la licencia completa, sin omitir caracteres.');
      const key=await importKey();
      const ok=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,signature,payloadBytes);
      if(!ok)throw new Error('La licencia no es auténtica');
      const payload=JSON.parse(bytesToText(payloadBytes));
      if(payload.v!==4||payload.plan!=='PRO')throw new Error('Plan de licencia no compatible');
      if(payload.exp){
        const end=new Date(payload.exp+'T23:59:59');
        if(Number.isNaN(end.getTime())||Date.now()>end.getTime())throw new Error('La licencia está vencida');
      }
      return payload;
    }catch(e){throw new Error(e.message||'No se pudo validar la licencia')}
  }
  window.HavycoLicense={verify};
})();
