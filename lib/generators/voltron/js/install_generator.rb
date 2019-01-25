require 'open-uri'

module Voltron
  module Generators
    module Js
      class InstallGenerator < Rails::Generators::Base

        source_root Rails.root.join("tmp")

        argument :modules, type: :array, default: []

        class_option :version, type: :string, default: "master", desc: "Specify a specific module version to install"

        desc "Install Voltron JS Modules"

        ASSET_URL = "https://raw.githubusercontent.com/ehainer/voltron/%{version}/app/assets/javascripts/%{library}"

        TEMP_DIR = Rails.root.join("tmp")

        def install_modules
          if modules.empty?
            puts "Please specify one or more modules to install, e.g. - `rails g voltron:js:install dialog [--version=0.1.0]`"
            return false
          end

          FileUtils.mkdir_p(TEMP_DIR) unless File.directory?(TEMP_DIR)

          modules.each do |mod|
            library = "voltron-#{mod.downcase}.js"
            version = options.version == "master" ? "master" : "v" + options.version.gsub(/[^0-9\.]/, "")
            asset = ASSET_URL % { version: version, library: library }

            begin
              download = open(asset)
              tmp = TEMP_DIR.join(library)
              IO.copy_stream(download, tmp)
              copy_file tmp, Rails.root.join("app", "assets", "javascripts", library)
            rescue OpenURI::HTTPError => e
              puts "Module '#{mod}' not found. Are you sure the version exists and that you typed the name correctly? (Lookup URL: #{asset})"
            end

          end
        end

      end
    end
  end
end