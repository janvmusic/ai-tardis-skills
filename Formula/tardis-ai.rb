class TardisAi < Formula
  desc "CLI to manage AI skills for Claude Code, OpenCode, and other agents"
  homepage "https://github.com/janvmusic/ai-tardis-skills"
  url "https://registry.npmjs.org/ai-tardis-skills/-/ai-tardis-skills-1.5.0.tgz"
  sha256 "16a4bf6e414d71bffe85b70c3d63a83f5c626b603f7bb4e14f8b43dbc688e533"
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
