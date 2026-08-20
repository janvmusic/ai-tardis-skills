class TardisAi < Formula
  desc "CLI to manage AI skills for Claude Code, OpenCode, and other agents"
  homepage "https://github.com/janvmusic/ai-tardis-skills"
  url "https://registry.npmjs.org/ai-tardis-skills/-/ai-tardis-skills-1.7.0.tgz"
  sha256 "d17df089287a508c4d9f24fe67899710b42fea19c663f9d72d6238c7ecb62c2b"
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
