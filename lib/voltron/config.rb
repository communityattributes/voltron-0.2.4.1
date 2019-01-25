require 'logger'
require 'uri'
require 'voltron/config/js'

module Voltron
  class Config

    include ::ActiveSupport::Callbacks

    define_callbacks :generate_voltron_config

    attr_accessor :logger, :debug

    attr_writer :base_url

    def initialize
      @logger = ::Logger.new(::Rails.root.join('log', 'voltron.log'))
      @debug ||= false
      @base_url ||= (Rails.application.config.action_controller.default_url_options.try(:[], :host) || 'http://localhost:3000')
    end

    def to_h
      run_callbacks :generate_voltron_config
      js.to_h.merge(debug: @debug)
    end

    def merge(data)
      js.custom.merge! data
    end

    def base_url
      @base_url = "http://#{@base_url}" unless @base_url.strip.start_with?('http')
      url = URI.parse(@base_url)
      port = url.port == 80 ? '' : ":#{url.port}"
      "#{url.scheme}://#{url.host}#{port}"
    end

  end
end
