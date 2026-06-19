import type { NoteName } from '../types';
import { getFrequency, getMidi } from '../audio/notes';

// Note factory — creates Note objects for lesson audio examples
function n(name: NoteName, octave: number) {
  const SOLFEGE: Record<NoteName, string> = {
    'C': 'do', 'C#': 'do#', 'D': 're', 'D#': 're#',
    'E': 'mi', 'F': 'fa', 'F#': 'fa#', 'G': 'sol',
    'G#': 'sol#', 'A': 'la', 'A#': 'la#', 'B': 'si',
  };
  return { name, octave, midi: getMidi(name, octave), frequency: getFrequency(name, octave), solfege: SOLFEGE[name] };
}

export interface AudioExample {
  label: string;
  notes: ReturnType<typeof n>[];
  desc?: string;
}

export interface QuizItem {
  question: string;
  notes?: ReturnType<typeof n>[];
  options: string[];
  answer: number;
}

export interface LessonSection {
  heading?: string;
  paragraphs: string[];
  audio?: AudioExample[];
  quiz?: QuizItem;
}

export interface LessonDef {
  id: string;
  title: string;
  subtitle: string;
  sections: LessonSection[];
}

export const LESSONS: LessonDef[] = [
  {
    id: '1',
    title: '认识音高',
    subtitle: '声音的高低 — 音高的基本概念',
    sections: [
      {
        heading: '什么是音高？',
        paragraphs: [
          '音高（Pitch）是我们对声音"高低"的感知。物理上，音高由声音的频率决定——频率越高，听起来越"尖"；频率越低，听起来越"沉"。',
          '在音乐中，每个音高都有一个名字。西方音乐使用字母 A B C D E F G，加上升降号（#）来表示 12 个不同的音。在中国声乐教育中，我们更常用唱名：do re mi fa sol la si。',
        ],
        audio: [
          { label: '听一个低音 (C3, ~131Hz)', notes: [n('C', 3)], desc: '这个音比较低沉、厚重' },
          { label: '听一个高音 (C5, ~523Hz)', notes: [n('C', 5)], desc: '这个音比较明亮、尖锐' },
          { label: '低音 → 高音 对比', notes: [n('C', 3), n('C', 5)], desc: '先低后高，感受音高的跳跃' },
        ],
      },
      {
        heading: '音高是相对的',
        paragraphs: [
          '有趣的是，我们对音高的感知是相对的，不是绝对的。大多数人可以轻易判断"这个音比那个音高"，但很难在没有参照的情况下说出一个音的具体名字。',
          '这就是为什么训练音准很重要——你需要建立对音高的"绝对记忆"，就像记住颜色一样记住每个音的感觉。',
          '在这个 app 中，你每次练习时会先听到所有候选音，建立参照，然后判断它们的顺序。',
        ],
      },
      {
        heading: '小测验',
        paragraphs: [],
        quiz: {
          question: '先听两个音，哪个更高？',
          notes: [n('C', 4), n('G', 4)],
          options: ['第一个音更高', '第二个音更高', '两个音一样高'],
          answer: 1,
        },
      },
    ],
  },
  {
    id: '2',
    title: '唱名与音名',
    subtitle: 'do re mi fa sol la si 的由来',
    sections: [
      {
        heading: '固定调唱名法',
        paragraphs: [
          '在声乐学习中，我们常用的唱名（solfege）来自意大利语：do、re、mi、fa、sol、la、si。它们分别对应音名 C、D、E、F、G、A、B。',
          '中国声乐教育通常使用"固定调唱名法"——无论什么调性，C 永远唱 do，D 永远唱 re。这和钢琴白键的排列是一致的。',
          '下面你可以点击每个唱名来听它的声音，建立声音和名字之间的联系：',
        ],
        audio: [
          { label: 'do (C4)', notes: [n('C', 4)], desc: 'do — 最基础的音，也是 C 大调的主音' },
          { label: 're (D4)', notes: [n('D', 4)], desc: 're — 比 do 高一个全音' },
          { label: 'mi (E4)', notes: [n('E', 4)], desc: 'mi — 比 re 高一个全音' },
          { label: 'fa (F4)', notes: [n('F', 4)], desc: 'fa — 比 mi 高一个半音' },
          { label: 'sol (G4)', notes: [n('G', 4)], desc: 'sol — 比 fa 高一个全音，明亮有力' },
          { label: 'la (A4)', notes: [n('A', 4)], desc: 'la — 标准音，440Hz，比 sol 高一个全音' },
          { label: 'si (B4)', notes: [n('B', 4)], desc: 'si — 比 la 高一个全音，有"导音"的感觉' },
        ],
      },
      {
        heading: '为什么有升降号？',
        paragraphs: [
          '钢琴上白键之间的黑键就是升降音。比如 C 和 D 之间的黑键，可以叫升 do（C#）或降 re（Db）。',
          '在本 app 的初级阶段，我们主要使用自然音（do re mi fa sol la si），随着关卡推进，会逐渐引入升降音。',
        ],
        audio: [
          { label: 'do (C4) → 升do (C#4) 对比', notes: [n('C', 4), n('C#', 4)], desc: '相差一个半音，仔细听差别' },
          { label: 'do → re → mi 上行', notes: [n('C', 4), n('D', 4), n('E', 4)], desc: '三个相邻的自然音' },
        ],
      },
      {
        heading: '小测验',
        paragraphs: [],
        quiz: {
          question: '请听这个音，它是什么唱名？',
          notes: [n('E', 4)],
          options: ['do', 'mi', 'sol', 'la'],
          answer: 1,
        },
      },
    ],
  },
  {
    id: '3',
    title: '八度与音域',
    subtitle: '同一个音名，不同高度',
    sections: [
      {
        heading: '什么是八度？',
        paragraphs: [
          '八度（Octave）是指频率相差一倍的两个音之间的关系。比如 C3（约131Hz）和 C4（约262Hz）相差一个八度，C4 和 C5（约523Hz）也相差一个八度。',
          '虽然频率差了一倍，但人耳听起来它们"是同一个音，只是高低不同"。这种奇妙的感觉叫做"八度等价"。',
          '下面你可以听同一音名在不同八度的表现：',
        ],
        audio: [
          { label: 'do₃ (C3, 131Hz)', notes: [n('C', 3)], desc: '低沉的 do' },
          { label: 'do₄ (C4, 262Hz)', notes: [n('C', 4)], desc: '中央 do，最常用的参照音' },
          { label: 'do₅ (C5, 523Hz)', notes: [n('C', 5)], desc: '明亮的 do，高八度' },
          { label: 'do₃ → do₄ → do₅ 连续', notes: [n('C', 3), n('C', 4), n('C', 5)], desc: '感受八度跳跃' },
        ],
      },
      {
        heading: '为什么八度很重要？',
        paragraphs: [
          '在唱歌中，男生和女生天然相差一个八度。同一首歌，男声和女声唱着同样的旋律，但音高差了一个八度。理解八度关系有助于你在不同音域中找到正确的音。',
          '在本 app 的练习中，候选音通常来自同一个八度或相邻八度，让你专注于音名（唱名）的辨别。',
        ],
      },
      {
        heading: '小测验',
        paragraphs: [],
        quiz: {
          question: '先听两个音。它们是同一个唱名吗？',
          notes: [n('G', 3), n('G', 4)],
          options: ['是，同一个唱名不同八度', '不是，两个不同的唱名'],
          answer: 0,
        },
      },
    ],
  },
  {
    id: '4',
    title: '半音关系',
    subtitle: '音与音之间的最小距离',
    sections: [
      {
        heading: '什么是半音？',
        paragraphs: [
          '半音（Semitone）是西方音乐中最小的音高间隔。钢琴上任意两个相邻的键（包括黑键）之间就是半音关系。两个半音组成一个全音。',
          '人对半音的感知需要训练。未经训练的耳朵很难区分相差一个半音的两个音——但这正是本 app 要帮你提升的能力！',
        ],
        audio: [
          { label: 'do → 升do（半音）', notes: [n('C', 4), n('C#', 4)], desc: '相差半音，仔细听' },
          { label: 'do → re（全音）', notes: [n('C', 4), n('D', 4)], desc: '相差全音，差异更明显' },
          { label: 'mi → fa（自然半音）', notes: [n('E', 4), n('F', 4)], desc: 'mi-fa 之间天然是半音' },
        ],
      },
      {
        heading: '关卡中的音距',
        paragraphs: [
          '在关卡模式中，我们通过"音距"（候选音之间的最小半音数）来控制难度：',
          '· 音距 ≥7 半音（如 do 到 sol）：音高差异大，容易区分',
          '· 音距 ≥4 半音（如 do 到 mi）：中等难度',
          '· 音距 ≥2 半音（如 do 到 re）：比较接近，需要仔细听',
          '· 音距 =1 半音（如 mi 到 fa）：最难，非常接近',
          '随着你不断通关，音距会逐渐缩小，挑战也越来越大。',
        ],
        audio: [
          { label: '大跨度：do → sol（7半音）', notes: [n('C', 4), n('G', 4)], desc: '差异很大，很容易区分' },
          { label: '小跨度：mi → fa（1半音）', notes: [n('E', 4), n('F', 4)], desc: '非常接近，需要仔细听' },
        ],
      },
      {
        heading: '小测验',
        paragraphs: [],
        quiz: {
          question: '听这两个音，它们的距离大约是多少？',
          notes: [n('C', 4), n('F', 4)],
          options: ['半音（很近）', '几个半音（中等距离）', '很远'],
          answer: 1,
        },
      },
    ],
  },
  {
    id: '5',
    title: '如何训练音准',
    subtitle: '方法论与练习建议',
    sections: [
      {
        heading: '建立参照记忆',
        paragraphs: [
          '绝对音感（Perfect Pitch）是天生的，很少有人拥有。但相对音感（Relative Pitch）是可以通过训练获得的。',
          '训练的核心方法是：建立参照音的记忆，然后通过比较来判断其他音。比如，先记住 la (A4 = 440Hz) 的声音，然后听到其他音时和 la 做比较。',
        ],
        audio: [
          { label: '标准音 la (A4, 440Hz)', notes: [n('A', 4)], desc: '记住这个声音，它是所有调音的基准' },
        ],
      },
      {
        heading: '从大到小，循序渐进',
        paragraphs: [
          '训练音准就像健身——不能一上来就挑战最大重量。本 app 的关卡系统就是按照这个原理设计的：',
          '',
          '第一阶段：2 个音，音距很大（≥7半音），先学会区分明显不同的音。',
          '第二阶段：3 个音，加入中间音，学会三个音之间的关系。',
          '第三阶段：音距缩小，音的数量增加，逐步逼近真实音乐的复杂程度。',
          '',
          '每关需要连续 3 轮完全正确才能通过。不要急着过关——反复听、反复练才是真正的学习。',
        ],
      },
      {
        heading: '实用技巧',
        paragraphs: [
          '1. 善用 🔈 按钮 — 在判断之前，先点击每个候选音听一遍，建立当轮的参照。',
          '2. 善用"播放序列" — 听不清就再播一遍，不要凭感觉乱猜。',
          '3. 注意播放时的视觉提示 — 播放序列时，当前响的音符按钮会高亮，这对初学者很有帮助。',
          '4. 从钢琴开始 — 钢琴音色最干净、泛音最少，最容易辨认。熟练后再尝试其他乐器。',
          '5. 每天练 5-10 分钟 — 短时间、高频次的练习比长时间一次性练习更有效。',
        ],
      },
    ],
  },
  {
    id: '6',
    title: '音程感知',
    subtitle: '音与音之间的距离 — 音感训练的核心',
    sections: [
      {
        heading: '什么是音程？',
        paragraphs: [
          '音程（Interval）是两个音之间的距离，用半音数来衡量。音程是音感训练的核心——当你能准确感知音程大小，就能听出旋律、判断和弦、甚至即兴演唱。',
          '不同的音程有不同的"色彩"。比如纯五度（7 个半音，如 do→sol）听起来空旷、稳定；大三度（4 个半音，如 do→mi）明亮、温暖；小三度（3 个半音，如 la→do）柔和、略带忧伤。',
          '学会识别音程的"色彩"，比死记硬背半音数更有效。下面来听几组常见音程，感受它们的不同气质：',
        ],
        audio: [
          { label: '纯五度 do→sol（7 半音）', notes: [n('C', 4), n('G', 4)], desc: '空旷、稳定，像远处的钟声' },
          { label: '大三度 do→mi（4 半音）', notes: [n('C', 4), n('E', 4)], desc: '明亮、温暖，像阳光' },
          { label: '小三度 la→do（3 半音）', notes: [n('A', 3), n('C', 4)], desc: '柔和、略带忧伤' },
          { label: '纯四度 do→fa（5 半音）', notes: [n('C', 4), n('F', 4)], desc: '坚定、有力量感' },
        ],
      },
      {
        heading: '协和与不协和',
        paragraphs: [
          '音程可以分为"协和"和"不协和"两类。协和音程（如纯五度、大三度、纯四度）听起来和谐、舒服；不协和音程（如三全音、小二度）听起来紧张、有冲突感。',
          '三全音（6 个半音，如 do→fa#）是最经典的不协和音程，中世纪被称为"音乐中的魔鬼"。但在现代音乐中，这种紧张感恰恰是很多精彩音乐的来源。',
          '训练音程感知的关键：先听协和音程建立基准，再逐渐加入不协和音程，学会区分它们的"紧张程度"。',
        ],
        audio: [
          { label: '三全音 do→fa#（6 半音）', notes: [n('C', 4), n('F#', 4)], desc: '紧张、不稳定——"音乐中的魔鬼"' },
          { label: '小二度 do→do#（1 半音）', notes: [n('C', 4), n('C#', 4)], desc: '极度紧张，几乎像摩擦' },
          { label: '大六度 do→la（9 半音）', notes: [n('C', 4), n('A', 4)], desc: '开阔、甜美，像深情的呼唤' },
        ],
      },
      {
        heading: '小测验',
        paragraphs: [],
        quiz: {
          question: '听这两个音，它们之间的距离是？',
          notes: [n('C', 4), n('E', 4)],
          options: ['很小的距离（1-2 半音）', '中等距离（3-5 半音）', '很大的距离（7+ 半音）'],
          answer: 1,
        },
      },
    ],
  },
  {
    id: '7',
    title: '和弦色彩',
    subtitle: '从单音到多音 — 和声感知的起点',
    sections: [
      {
        heading: '什么是和弦？',
        paragraphs: [
          '和弦是三个或更多音同时（或快速连续）发出的声音。即使你只唱单旋律，理解和弦也很重要——因为唱歌时你会听到伴奏中的和弦，你的音准会受到和弦的影响。',
          '最基本的两种和弦是大三和弦和小三和弦。大三和弦听起来明亮、快乐；小三和弦听起来暗淡、忧伤。它们的区别只在于中间那个音——大三度 vs 小三度。',
          '下面听两组和弦的琶音（从低到高快速弹奏），感受它们的色彩差异：',
        ],
        audio: [
          { label: '大三和弦 C-E-G（do mi sol）', notes: [n('C', 4), n('E', 4), n('G', 4)], desc: '明亮、快乐、稳定' },
          { label: '小三和弦 C-D#-G（do 降mi sol）', notes: [n('C', 4), n('D#', 4), n('G', 4)], desc: '暗淡、忧伤、柔美' },
          { label: '再听一次大三明亮感', notes: [n('F', 4), n('A', 4), n('C', 5)], desc: 'F 大三和弦，同样明亮' },
          { label: '再听一次小三暗淡感', notes: [n('A', 3), n('C', 4), n('E', 4)], desc: 'Am 小三和弦，同样忧伤' },
        ],
      },
      {
        heading: '为什么歌手需要和弦感？',
        paragraphs: [
          '很多歌手跑调不是因为"唱不准音"，而是因为"听不出和弦"。当伴奏弹奏一个小三和弦，你的耳朵如果捕捉不到它的暗淡色彩，就可能唱出和大三和弦搭配的音——于是听起来"不搭"。',
          '训练和弦感知不需要你学会弹钢琴。只要多听、多比较大三和小三的区别，逐渐建立对和弦色彩的直觉。这个过程和训练音程感知是一样的——从粗到细，从明显到微妙。',
          '在关卡模式的后期阶段，你会遇到多个音同时出现的情况，这时候和弦感知能力就能派上用场了。',
        ],
        audio: [
          { label: '对比：大三 → 小三', notes: [n('C', 4), n('E', 4), n('G', 4), n('C', 4), n('D#', 4), n('G', 4)], desc: '先大三后小三，仔细感受明暗变化' },
        ],
      },
      {
        heading: '小测验',
        paragraphs: [],
        quiz: {
          question: '听这组和弦琶音，它是大三还是小三？',
          notes: [n('G', 3), n('D#', 4), n('G', 4)],
          options: ['大三和弦（明亮）', '小三和弦（暗淡）', '听不出来'],
          answer: 1,
        },
      },
    ],
  },
  {
    id: '8',
    title: '旋律记忆',
    subtitle: '听到 → 记住 → 再现 — 音感的终极目标',
    sections: [
      {
        heading: '什么是旋律记忆？',
        paragraphs: [
          '旋律记忆是指听到一段旋律后，能在脑中"回放"它，甚至用唱名唱出来。这是音感训练的终极目标——不是辨认单个音，而是记住一串音的运动轨迹。',
          '好的旋律记忆能力意味着：听几遍就能学会一首歌的旋律、能在脑中"预听"乐谱、唱歌时不容易跑调（因为你脑中清楚下一个音应该是什么）。',
          '旋律记忆有三个环节：听清 → 记住 → 再现。每个环节都可以单独训练。在本 app 中，"播放序列"帮你练习听清，"选音符"帮你练习记住和再现。',
        ],
        audio: [
          { label: '简单旋律 ① do-mi-sol-mi-do', notes: [n('C', 4), n('E', 4), n('G', 4), n('E', 4), n('C', 4)], desc: '上行再下行，像一座拱桥' },
          { label: '简单旋律 ② sol-mi-re-do', notes: [n('G', 4), n('E', 4), n('D', 4), n('C', 4)], desc: '下行旋律，像叹气' },
          { label: '跳跃旋律 ③ do-sol-do-sol', notes: [n('C', 4), n('G', 4), n('C', 4), n('G', 4)], desc: '在两个音之间跳跃' },
        ],
      },
      {
        heading: '训练方法',
        paragraphs: [
          '分段记忆：不要一次记 8 个音，先记前 2-3 个，再记下一组。就像记电话号码一样——分组记比一口气记更容易。',
          '唱名标记：听到每个音时，在脑中给它"贴标签"。比如听到 do-mi-sol，不要只记"高-更高-最高"，而是明确标记"do, mi, sol"。唱名就是你脑中的"索引"。',
          '手势辅助：很多声乐老师会用手势表示音高——低音在腰间、中音在胸前、高音在头顶。虽然看起来夸张，但身体动作确实能强化音高记忆。',
          '轮廓优先：先记旋律的"轮廓"（上行、下行、跳跃、平缓），再填充具体音名。轮廓是骨架，音名是细节。',
        ],
      },
      {
        heading: '音感的类型',
        paragraphs: [
          '旋律音感（Melodic Ear）：识别单音序列的能力，也就是本 app 主要训练的能力。它帮助你在唱歌时准确再现旋律。',
          '和声音感（Harmonic Ear）：识别同时发出的多个音的能力。它帮助你感知和弦、和声，在有伴奏的情况下保持音准。',
          '节奏音感（Rhythmic Ear）：识别节拍和节奏模式的能力。虽然本 app 不专门训练节奏，但节奏感对唱歌同样重要。',
          '三种音感互相支撑。旋律音感是基础，先把它练好，其他两种会更容易发展。',
        ],
        audio: [
          { label: '旋律型：do-re-mi-sol-mi-re-do', notes: [n('C', 4), n('D', 4), n('E', 4), n('G', 4), n('E', 4), n('D', 4), n('C', 4)], desc: '完整的上下行旋律' },
        ],
      },
      {
        heading: '小测验',
        paragraphs: [],
        quiz: {
          question: '听这段旋律，它的轮廓是什么形状？',
          notes: [n('C', 4), n('E', 4), n('G', 4), n('C', 5), n('G', 4), n('E', 4), n('C', 4)],
          options: ['一直上行 ↑', '先上后下 ∧', '先下后上 ∨', '一直在跳跃 ↕'],
          answer: 1,
        },
      },
    ],
  },
];
