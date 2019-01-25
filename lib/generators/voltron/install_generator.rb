module Voltron
  module Generators
    class InstallGenerator < Rails::Generators::Base

      desc 'Add Voltron initializer'

      def copy_initializer
        create_file Rails.root.join('config', 'initializers', 'voltron.rb'), <<-CONTENT
Voltron.setup do |config|

  # === Voltron Base Configuration ===

  # Whether to enable debug output in the browser console and terminal window
  # config.debug = false

  # The base url of the site. Used by various voltron-* gems to correctly build urls
  # Defaults to Rails.application.config.action_controller.default_url_options[:host], or 'localhost:3000' if not set
  # config.base_url = '#{Rails.application.config.action_controller.default_url_options.try(:[], :host) || "http://localhost:3000"}'

  # What logger calls to Voltron.log should use
  # config.logger = Logger.new(Rails.root.join('log', 'voltron.log'))

end
CONTENT
      end

    end
  end
end