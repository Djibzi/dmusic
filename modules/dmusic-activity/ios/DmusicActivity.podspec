require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'DmusicActivity'
  s.version        = package['version']
  s.summary        = 'DMusic Live Activity bridge'
  s.description    = 'Native module to control iOS Live Activities from React Native.'
  s.author         = ''
  s.homepage       = 'https://github.com/'
  s.platforms      = { :ios => '17.0' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.swift_version  = '5.4'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,swift}"
end
