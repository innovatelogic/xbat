//----------------------------------------------------------------------------------------------
function getSecrets() {
  const props = PropertiesService.getScriptProperties();
  
  return {
    AWS_ACCESS_KEY: props.getProperty('AWS_ACCESS_KEY'),
    AWS_SECRET_KEY: props.getProperty('AWS_SECRET_KEY'),
    AWS_REGION: props.getProperty('AWS_REGION'),
    AWS_SERVICE: props.getProperty('AWS_SERVICE'),
    AWS_BUCKET : props.getProperty('AWS_BUCKET'),
    SCRIPT_ID : props.getProperty('SCRIPT_ID')
  };
}

//----------------------------------------------------------------------------------------------
function is_production() {
  const { SCRIPT_ID } = getSecrets();
  const currentScriptId = ScriptApp.getScriptId();

  // If no configured prod script -> treat as non-prod
  if (!SCRIPT_ID) {
    return false;
  }

  return currentScriptId === SCRIPT_ID;
}