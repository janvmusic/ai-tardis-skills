class TardisAi < Formula
  desc "CLI to manage AI skills for Claude Code, OpenCode, and other agents"
  homepage "https://github.com/janvmusic/ai-tardis-skills"
  url "https://registry.npmjs.org/ai-tardis-skills/-/ai-tardis-skills-2.1.1.tgz"
  sha256 "da8a46279a28d061e5ed17ba003edfe115f9ded2d9a74eddc9c8e55301f6938e"
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
