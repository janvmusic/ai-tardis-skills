class TardisAi < Formula
  desc "CLI to manage AI skills for Claude Code, OpenCode, and other agents"
  homepage "https://github.com/janvmusic/ai-tardis-skills"
  url "https://registry.npmjs.org/ai-tardis-skills/-/ai-tardis-skills-2.2.1.tgz"
  sha256 "490f9ba027dbb18027792ea02ed2abee829fa8cbf4dd56e28d2b62217f2dcb55"
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
