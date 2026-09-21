class TardisAi < Formula
  desc "CLI to manage AI skills for Claude Code, OpenCode, and other agents"
  homepage "https://github.com/janvmusic/ai-tardis-skills"
  url "https://registry.npmjs.org/ai-tardis-skills/-/ai-tardis-skills-2.0.1.tgz"
  sha256 "43eba034bfee3f35187d0a3764c35d034e64143182ea2f0423d3c038d9ae14d9"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match "Available skills:", shell_output("#{bin}/tardis-ai list")
  end
end
