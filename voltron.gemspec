# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'voltron/version'

Gem::Specification.new do |spec|
  spec.name          = 'voltron'
  spec.version       = Voltron::VERSION
  spec.authors       = ['Eric Hainer']
  spec.email         = ['eric@commercekitchen.com']

  spec.summary       = %q{Voltron}
  spec.homepage      = 'https://github.com/ehainer/voltron'
  spec.license       = 'MIT'

  spec.files         = `git ls-files -z`.split("\x0").reject { |f| f.match(%r{^(test|spec|features)/}) }
  spec.bindir        = 'exe'
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ['lib']

  spec.add_dependency 'rails', '>= 4.2'

  spec.add_development_dependency 'simplecov', '>= 0.12.0'
  spec.add_development_dependency 'bundler', '>= 1.12'
  spec.add_development_dependency 'rake', '>= 10.0'
  spec.add_development_dependency 'rspec', '>= 3.0'
  spec.add_development_dependency 'rspec-rails', '>= 3.4'
  spec.add_development_dependency 'sqlite3', '>= 1.2'
  spec.add_development_dependency 'colorize', '>= 0.8.1'
  spec.add_development_dependency 'jquery-rails', '~> 4.2.0'
end
