export function PixelCatLoader({ visible }: { visible: boolean }) {
  if (!visible) return null;

  const fur = "#7c8db5";
  const dark = "#5a6a8a";
  const eye = "#f59e0b";
  const nose = "#f472b6";
  const white = "#c8d0e0";

  return (
    <div className="fixed inset-0 z-[500] bg-[#0a0a1a]/95 flex flex-col items-center justify-center gap-6 animate-[fadeUp_0.3s_ease]">
      {/* 英短蓝猫 - 闭眼睡觉，慵懒姿态 */}
      <div className="relative" style={{ width: 72, height: 48 }}>
        <div
          className="animate-cat-breathe absolute"
          style={{
            width: 4, height: 4, left: 6, top: 0,
            boxShadow: `
              /* 左耳（略塌） */
              12px 0px 0 ${dark}, 16px 0px 0 ${fur},
              /* 右耳（略塌） */
              44px 0px 0 ${fur}, 48px 0px 0 ${dark},
              /* 头顶 */
              8px 4px 0 ${dark}, 12px 4px 0 ${fur}, 16px 4px 0 ${fur}, 20px 4px 0 ${fur},
              24px 4px 0 ${fur}, 28px 4px 0 ${fur}, 32px 4px 0 ${fur}, 36px 4px 0 ${fur},
              40px 4px 0 ${fur}, 44px 4px 0 ${fur}, 48px 4px 0 ${dark},
              /* 脸上部 */
              4px 8px 0 ${dark}, 8px 8px 0 ${fur}, 12px 8px 0 ${fur}, 16px 8px 0 ${fur},
              20px 8px 0 ${fur}, 24px 8px 0 ${fur}, 28px 8px 0 ${fur},
              32px 8px 0 ${fur}, 36px 8px 0 ${fur}, 40px 8px 0 ${fur},
              44px 8px 0 ${fur}, 48px 8px 0 ${dark},
              /* 闭眼 - 弯弯的弧线 */
              0px 12px 0 ${dark}, 4px 12px 0 ${fur}, 8px 12px 0 ${fur},
              12px 12px 0 ${dark}, 16px 12px 0 ${dark}, 20px 12px 0 ${dark},
              24px 12px 0 ${fur}, 28px 12px 0 ${fur},
              32px 12px 0 ${dark}, 36px 12px 0 ${dark}, 40px 12px 0 ${dark},
              44px 12px 0 ${fur}, 48px 12px 0 ${dark},
              /* 脸中部 - 鼻子居中 */
              0px 16px 0 ${dark}, 4px 16px 0 ${fur}, 8px 16px 0 ${fur},
              12px 16px 0 ${fur}, 16px 16px 0 ${white}, 20px 16px 0 ${white},
              24px 16px 0 ${nose}, 28px 16px 0 ${white},
              32px 16px 0 ${white}, 36px 16px 0 ${fur}, 40px 16px 0 ${fur},
              44px 16px 0 ${fur}, 48px 16px 0 ${dark},
              /* 脸颊 */
              0px 20px 0 ${dark}, 4px 20px 0 ${fur}, 8px 20px 0 ${fur},
              12px 20px 0 ${fur}, 16px 20px 0 ${fur}, 20px 20px 0 ${white},
              24px 20px 0 ${white}, 28px 20px 0 ${white},
              32px 20px 0 ${fur}, 36px 20px 0 ${fur}, 40px 20px 0 ${fur},
              44px 20px 0 ${fur}, 48px 20px 0 ${dark},
              /* 下巴 */
              4px 24px 0 ${dark}, 8px 24px 0 ${fur}, 12px 24px 0 ${fur},
              16px 24px 0 ${fur}, 20px 24px 0 ${fur}, 24px 24px 0 ${fur},
              28px 24px 0 ${fur}, 32px 24px 0 ${fur}, 36px 24px 0 ${fur},
              40px 24px 0 ${fur}, 44px 24px 0 ${dark},
              /* 脖子 */
              12px 28px 0 ${fur}, 16px 28px 0 ${fur}, 20px 28px 0 ${fur},
              24px 28px 0 ${fur}, 28px 28px 0 ${fur}, 32px 28px 0 ${fur},
              36px 28px 0 ${fur}, 40px 28px 0 ${fur},
              /* 身体 - 蜷缩 */
              8px 32px 0 ${dark}, 12px 32px 0 ${fur}, 16px 32px 0 ${fur},
              20px 32px 0 ${fur}, 24px 32px 0 ${fur}, 28px 32px 0 ${fur},
              32px 32px 0 ${fur}, 36px 32px 0 ${fur}, 40px 32px 0 ${fur},
              44px 32px 0 ${dark},
              4px 36px 0 ${dark}, 8px 36px 0 ${fur}, 12px 36px 0 ${fur},
              16px 36px 0 ${fur}, 20px 36px 0 ${fur}, 24px 36px 0 ${fur},
              28px 36px 0 ${fur}, 32px 36px 0 ${fur}, 36px 36px 0 ${fur},
              40px 36px 0 ${fur}, 44px 36px 0 ${fur}, 48px 36px 0 ${dark},
              /* 前爪（伸懒腰） */
              0px 40px 0 ${dark}, 4px 40px 0 ${white}, 8px 40px 0 ${white},
              36px 40px 0 ${fur}, 40px 40px 0 ${fur}, 44px 40px 0 ${dark},
              /* 尾巴（卷在身边） */
              48px 36px 0 ${fur}, 52px 32px 0 ${fur}, 56px 28px 0 ${fur}, 52px 36px 0 ${dark}
            `,
          }}
        />
        {/* Zzz */}
        <div className="absolute -top-2 right-0 animate-zzz">
          <span className="text-[#7c8db5] text-[8px] font-['VT323',monospace]">Z</span>
        </div>
        <div className="absolute -top-6 right-2 animate-zzz" style={{ animationDelay: "0.5s" }}>
          <span className="text-[#7c8db5] text-[10px] font-['VT323',monospace]">Z</span>
        </div>
        <div className="absolute -top-10 right-4 animate-zzz" style={{ animationDelay: "1s" }}>
          <span className="text-[#7c8db5] text-[12px] font-['VT323',monospace]">Z</span>
        </div>
      </div>

      <div className="text-[#7c8db5] text-[10px] font-['VT323',monospace] animate-[blink_2s_steps(1)_infinite]">
        ✦ 正在思考 ✦
      </div>

      <style>{`
        @keyframes catBreathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.04); }
        }
        @keyframes zzz {
          0% { opacity: 0; transform: translateY(0) translateX(0); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-24px) translateX(8px); }
        }
        .animate-cat-breathe {
          animation: catBreathe 2s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .animate-zzz {
          animation: zzz 1.8s ease-out infinite;
        }
      `}</style>
    </div>
  );
}
