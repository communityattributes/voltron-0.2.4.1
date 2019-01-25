module VoltronHelper

  def voltron_include_tag
    javascript_tag "Voltron.initialize(#{voltron_config_json});", type: 'text/javascript'
  end

  def voltron_config_json
    Voltron.config.to_h.merge({ controller: controller_name, action: action_name, auth_token: form_authenticity_token }).to_json.html_safe
  end

end
