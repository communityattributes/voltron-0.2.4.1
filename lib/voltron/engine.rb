module Voltron
  class Engine < Rails::Engine

    isolate_namespace Voltron

    config.autoload_paths += Dir["#{config.root}/lib/**/"]

    initializer "voltron.initialize" do
      ::ActionController::Base.send :helper, ::VoltronHelper
    end

  end
end
