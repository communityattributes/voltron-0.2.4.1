module Voltron
  class Asset

    def find(file)
      files(file)[file]
    end

    def files(type = "*", sub_dir = "**")
      assets = Hash.new
      Rails.application.config.assets.paths.each do |path|
        Dir.glob("#{path}/#{sub_dir}/#{type}").each { |file| assets[File.basename(file)] = file }
      end
      assets
    end

    def file_path(filename)
      if Rails.application.config.assets.digest && Rails.application.config.assets.compile
        filename = Rails.application.assets.find_asset(filename.to_s).try(:digest_path) || filename.to_s
      end

      File.join(Rails.application.config.assets.prefix, filename.to_s)
    end
  end
end
