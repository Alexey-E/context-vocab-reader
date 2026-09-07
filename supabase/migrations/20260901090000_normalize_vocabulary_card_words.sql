create function public.vocabulary_unicode_17_combining_class(
  input_character text
)
returns integer
language plpgsql
immutable
strict
parallel safe
set search_path = ''
as $$
declare
  -- Generated from Unicode 17.0 DerivedCombiningClass.txt.
  combining_class_values constant integer[] := array[1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 84, 91, 103, 107, 118, 122, 129, 130, 132, 202, 214, 216, 218, 220, 222, 224, 226, 228, 230, 232, 233, 234, 240];
  combining_class_ranges constant int4multirange[] := array[
    '{[820,825), [7380,7381), [7394,7401), [8402,8404), [8408,8411), [8421,8423), [8426,8428), [68153,68154), [92912,92917), [113822,113823), [119143,119146)}'::int4multirange, -- 1
    '{[94192,94194)}'::int4multirange, -- 6
    '{[2364,2365), [2492,2493), [2620,2621), [2748,2749), [2876,2877), [3132,3133), [3260,3261), [4151,4152), [6964,6965), [7142,7143), [7223,7224), [43443,43444), [69818,69819), [70003,70004), [70090,70091), [70198,70199), [70377,70378), [70459,70461), [70726,70727), [70851,70852), [71104,71105), [71351,71352), [71738,71739), [72003,72004), [73026,73027), [125258,125259)}'::int4multirange, -- 7
    '{[12441,12443)}'::int4multirange, -- 8
    '{[2381,2382), [2509,2510), [2637,2638), [2765,2766), [2893,2894), [3021,3022), [3149,3150), [3277,3278), [3387,3389), [3405,3406), [3530,3531), [3642,3643), [3770,3771), [3972,3973), [4153,4155), [5908,5909), [5909,5910), [5940,5941), [6098,6099), [6752,6753), [6980,6981), [7082,7083), [7083,7084), [7154,7156), [11647,11648), [43014,43015), [43052,43053), [43204,43205), [43347,43348), [43456,43457), [43766,43767), [44013,44014), [68159,68160), [69702,69703), [69744,69745), [69759,69760), [69817,69818), [69939,69941), [70080,70081), [70197,70198), [70378,70379), [70477,70478), [70606,70607), [70607,70608), [70608,70609), [70722,70723), [70850,70851), [71103,71104), [71231,71232), [71350,71351), [71467,71468), [71737,71738), [71997,71998), [71998,71999), [72160,72161), [72244,72245), [72263,72264), [72345,72346), [72767,72768), [73028,73030), [73111,73112), [73537,73538), [73538,73539), [90415,90416)}'::int4multirange, -- 9
    '{[1456,1457)}'::int4multirange, -- 10
    '{[1457,1458)}'::int4multirange, -- 11
    '{[1458,1459)}'::int4multirange, -- 12
    '{[1459,1460)}'::int4multirange, -- 13
    '{[1460,1461)}'::int4multirange, -- 14
    '{[1461,1462)}'::int4multirange, -- 15
    '{[1462,1463)}'::int4multirange, -- 16
    '{[1463,1464)}'::int4multirange, -- 17
    '{[1464,1465), [1479,1480)}'::int4multirange, -- 18
    '{[1465,1467)}'::int4multirange, -- 19
    '{[1467,1468)}'::int4multirange, -- 20
    '{[1468,1469)}'::int4multirange, -- 21
    '{[1469,1470)}'::int4multirange, -- 22
    '{[1471,1472)}'::int4multirange, -- 23
    '{[1473,1474)}'::int4multirange, -- 24
    '{[1474,1475)}'::int4multirange, -- 25
    '{[64286,64287)}'::int4multirange, -- 26
    '{[1611,1612), [2288,2289)}'::int4multirange, -- 27
    '{[1612,1613), [2289,2290)}'::int4multirange, -- 28
    '{[1613,1614), [2290,2291)}'::int4multirange, -- 29
    '{[1560,1561), [1614,1615)}'::int4multirange, -- 30
    '{[1561,1562), [1615,1616)}'::int4multirange, -- 31
    '{[1562,1563), [1616,1617)}'::int4multirange, -- 32
    '{[1617,1618)}'::int4multirange, -- 33
    '{[1618,1619)}'::int4multirange, -- 34
    '{[1648,1649)}'::int4multirange, -- 35
    '{[1809,1810)}'::int4multirange, -- 36
    '{[3157,3158)}'::int4multirange, -- 84
    '{[3158,3159)}'::int4multirange, -- 91
    '{[3640,3642)}'::int4multirange, -- 103
    '{[3656,3660)}'::int4multirange, -- 107
    '{[3768,3770)}'::int4multirange, -- 118
    '{[3784,3788)}'::int4multirange, -- 122
    '{[3953,3954)}'::int4multirange, -- 129
    '{[3954,3955), [3962,3966), [3968,3969)}'::int4multirange, -- 130
    '{[3956,3957)}'::int4multirange, -- 132
    '{[801,803), [807,809), [7632,7633)}'::int4multirange, -- 202
    '{[7630,7631)}'::int4multirange, -- 214
    '{[795,796), [3897,3898), [119141,119143), [119150,119155)}'::int4multirange, -- 216
    '{[7674,7675), [12330,12331)}'::int4multirange, -- 218
    '{[790,794), [796,801), [803,807), [809,820), [825,829), [839,842), [845,847), [851,855), [857,859), [1425,1426), [1430,1431), [1435,1436), [1442,1448), [1450,1451), [1477,1478), [1621,1623), [1628,1629), [1631,1632), [1763,1764), [1770,1771), [1773,1774), [1841,1842), [1844,1845), [1847,1850), [1851,1853), [1854,1855), [1858,1859), [1860,1861), [1862,1863), [1864,1865), [2034,2035), [2045,2046), [2137,2140), [2201,2204), [2255,2260), [2275,2276), [2278,2279), [2281,2282), [2285,2288), [2294,2295), [2297,2299), [2386,2387), [3864,3866), [3893,3894), [3895,3896), [4038,4039), [4237,4238), [6459,6460), [6680,6681), [6783,6784), [6837,6843), [6845,6846), [6847,6849), [6851,6853), [6858,6859), [6877,6878), [6886,6887), [7020,7021), [7381,7386), [7388,7392), [7405,7406), [7618,7619), [7626,7627), [7631,7632), [7673,7674), [7677,7678), [7679,7680), [8424,8425), [8428,8432), [43307,43310), [43700,43701), [65063,65070), [66045,66046), [66272,66273), [68109,68110), [68154,68155), [68326,68327), [69370,69372), [69373,69376), [69446,69448), [69451,69452), [69453,69457), [69507,69508), [69509,69510), [119163,119171), [119178,119180), [124142,124143), [124399,124400), [125136,125143)}'::int4multirange, -- 220
    '{[1434,1435), [1453,1454), [6457,6458), [12333,12334)}'::int4multirange, -- 222
    '{[12334,12336)}'::int4multirange, -- 224
    '{[119149,119150)}'::int4multirange, -- 226
    '{[1454,1455), [6313,6314), [7671,7673), [12331,12332)}'::int4multirange, -- 228
    '{[768,789), [829,837), [838,839), [842,845), [848,851), [855,856), [859,860), [867,880), [1155,1160), [1426,1430), [1431,1434), [1436,1442), [1448,1450), [1451,1453), [1455,1456), [1476,1477), [1552,1560), [1619,1621), [1623,1628), [1629,1631), [1750,1757), [1759,1763), [1764,1765), [1767,1769), [1771,1773), [1840,1841), [1842,1844), [1845,1847), [1850,1851), [1853,1854), [1855,1858), [1859,1860), [1861,1862), [1863,1864), [1865,1867), [2027,2034), [2035,2036), [2070,2074), [2075,2084), [2085,2088), [2089,2094), [2199,2201), [2204,2208), [2250,2255), [2260,2274), [2276,2278), [2279,2281), [2282,2285), [2291,2294), [2295,2297), [2299,2304), [2385,2386), [2387,2389), [2558,2559), [3970,3972), [3974,3976), [4957,4960), [6109,6110), [6458,6459), [6679,6680), [6773,6781), [6832,6837), [6843,6845), [6849,6851), [6853,6858), [6859,6877), [6880,6886), [6887,6891), [7019,7020), [7021,7028), [7376,7379), [7386,7388), [7392,7393), [7412,7413), [7416,7418), [7616,7618), [7619,7626), [7627,7629), [7633,7670), [7675,7676), [7678,7679), [8400,8402), [8404,8408), [8411,8413), [8417,8418), [8423,8424), [8425,8426), [8432,8433), [11503,11506), [11744,11776), [42607,42608), [42612,42622), [42654,42656), [42736,42738), [43232,43250), [43696,43697), [43698,43700), [43703,43705), [43710,43712), [43713,43714), [65056,65063), [65070,65072), [66422,66427), [68111,68112), [68152,68153), [68325,68326), [68900,68904), [68969,68974), [69291,69293), [69448,69451), [69452,69453), [69506,69507), [69508,69509), [69888,69891), [70502,70509), [70512,70517), [70750,70751), [92976,92983), [119173,119178), [119210,119214), [119362,119365), [122880,122887), [122888,122905), [122907,122914), [122915,122917), [122918,122923), [123023,123024), [123184,123191), [123566,123567), [123628,123632), [124143,124144), [124398,124399), [124643,124644), [124646,124647), [124654,124656), [124661,124662), [125252,125258)}'::int4multirange, -- 230
    '{[789,790), [794,795), [856,857), [7670,7671), [12332,12333), [124140,124142)}'::int4multirange, -- 232
    '{[860,861), [863,864), [866,867), [7676,7677)}'::int4multirange, -- 233
    '{[861,863), [864,866), [6891,6892), [7629,7630)}'::int4multirange, -- 234
    '{[837,838)}'::int4multirange -- 240
  ];
  code_point integer := pg_catalog.ascii(input_character);
begin
  for class_index in 1..pg_catalog.cardinality(combining_class_values) loop
    if code_point <@ combining_class_ranges[class_index] then
      return combining_class_values[class_index];
    end if;
  end loop;

  return 0;
end;
$$;

revoke execute
on function public.vocabulary_unicode_17_combining_class(text)
from public, anon;

grant execute
on function public.vocabulary_unicode_17_combining_class(text)
to authenticated, service_role;

create function public.normalize_vocabulary_unicode_17(
  input_value text,
  compatibility boolean
)
returns text
language plpgsql
stable
strict
parallel safe
set search_path = ''
as $$
declare
  -- Characters whose non-zero canonical combining class was added after
  -- PostgreSQL 17's Unicode 15.1 normalization tables.
  post_15_1_combining_marks constant int4multirange := '{
    [2199,2200), [6863,6878), [6880,6892), [70606,70609),
    [68969,68974), [69370,69372), [90415,90416), [124398,124400),
    [124643,124644), [124646,124647), [124654,124656), [124661,124662)
  }'::int4multirange;
  -- Canonical decompositions and compositions added in Unicode 16.0.
  unicode_17_decomposition_sources constant text[] := array[
    U&'\+0105C9', U&'\+0105E4', U&'\+011383', U&'\+011385',
    U&'\+01138E', U&'\+011391', U&'\+0113C5', U&'\+0113C7',
    U&'\+0113C8', U&'\+016121', U&'\+016122', U&'\+016123',
    U&'\+016124', U&'\+016125', U&'\+016126', U&'\+016127',
    U&'\+016128', U&'\+016D68', U&'\+016D69', U&'\+016D6A'
  ];
  unicode_17_decomposition_targets constant text[] := array[
    U&'\+0105D2\0307', U&'\+0105DA\0307', U&'\+011382\+0113C9',
    U&'\+011384\+0113BB', U&'\+01138B\+0113C2', U&'\+011390\+0113C9',
    U&'\+0113C2\+0113C2', U&'\+0113C2\+0113B8', U&'\+0113C2\+0113C9',
    U&'\+01611E\+01611E', U&'\+01611E\+016129', U&'\+01611E\+01611F',
    U&'\+016129\+01611F', U&'\+01611E\+016120',
    U&'\+01611E\+01611E\+01611F', U&'\+01611E\+016129\+01611F',
    U&'\+01611E\+01611E\+016120', U&'\+016D67\+016D67',
    U&'\+016D63\+016D67', U&'\+016D63\+016D67\+016D67'
  ];
  unicode_17_composition_sources constant text[] := array[
    U&'\+016121\+01611F', U&'\+016121\+016120', U&'\+016122\+01611F',
    U&'\+016D69\+016D67', U&'\+0105D2\0307', U&'\+0105DA\0307',
    U&'\+011382\+0113C9', U&'\+011384\+0113BB', U&'\+01138B\+0113C2',
    U&'\+0113C2\+0113C2', U&'\+0113C2\+0113C9', U&'\+0113C2\+0113B8',
    U&'\+011390\+0113C9', U&'\+01611E\+016123', U&'\+01611E\+016124',
    U&'\+01611E\+016125', U&'\+01611E\+01611E', U&'\+01611E\+016129',
    U&'\+01611E\+01611F', U&'\+01611E\+016120', U&'\+016129\+01611F',
    U&'\+016D67\+016D67', U&'\+016D63\+016D68', U&'\+016D63\+016D67'
  ];
  unicode_17_composition_targets constant text[] := array[
    U&'\+016126', U&'\+016128', U&'\+016127', U&'\+016D6A',
    U&'\+0105C9', U&'\+0105E4', U&'\+011383', U&'\+011385',
    U&'\+01138E', U&'\+0113C5', U&'\+0113C8', U&'\+0113C7',
    U&'\+011391', U&'\+016126', U&'\+016127', U&'\+016128',
    U&'\+016121', U&'\+016122', U&'\+016123', U&'\+016125',
    U&'\+016124', U&'\+016D68', U&'\+016D6A', U&'\+016D69'
  ];
  candidate text;
  characters text[];
  combining_class integer;
  composition_index integer;
  current_character text;
  has_new_combining_mark boolean := false;
  last_combining_class integer := 0;
  normalized_value text := input_value;
  output_characters text[] := array[]::text[];
  previous_combining_class integer;
  previous_value text;
  reorder_index integer;
  starter_index integer;
begin
  for mapping_index in 1..pg_catalog.cardinality(
    unicode_17_decomposition_sources
  ) loop
    normalized_value := pg_catalog.replace(
      normalized_value,
      unicode_17_decomposition_sources[mapping_index],
      unicode_17_decomposition_targets[mapping_index]
    );
  end loop;

  if compatibility then
    -- Compatibility mappings added after Unicode 15.1.
    normalized_value := pg_catalog.translate(
      normalized_value,
      U&'\A7F1\+01CCD6\+01CCD7\+01CCD8\+01CCD9\+01CCDA\+01CCDB\+01CCDC\+01CCDD\+01CCDE\+01CCDF\+01CCE0\+01CCE1\+01CCE2\+01CCE3\+01CCE4\+01CCE5\+01CCE6\+01CCE7\+01CCE8\+01CCE9\+01CCEA\+01CCEB\+01CCEC\+01CCED\+01CCEE\+01CCEF\+01CCF0\+01CCF1\+01CCF2\+01CCF3\+01CCF4\+01CCF5\+01CCF6\+01CCF7\+01CCF8\+01CCF9',
      'SABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    );
  end if;

  characters := pg_catalog.string_to_array(normalized_value, null);

  for character_index in 1..coalesce(
    pg_catalog.cardinality(characters),
    0
  ) loop
    if pg_catalog.ascii(characters[character_index])
      <@ post_15_1_combining_marks
    then
      has_new_combining_mark := true;
      exit;
    end if;
  end loop;

  if not has_new_combining_mark then
    if compatibility then
      normalized_value := normalize(normalized_value, NFKC);
    else
      normalized_value := normalize(normalized_value, NFC);
    end if;

    loop
      previous_value := normalized_value;

      for mapping_index in 1..pg_catalog.cardinality(
        unicode_17_composition_sources
      ) loop
        normalized_value := pg_catalog.replace(
          normalized_value,
          unicode_17_composition_sources[mapping_index],
          unicode_17_composition_targets[mapping_index]
        );
      end loop;

      exit when normalized_value = previous_value;
    end loop;

    return normalized_value;
  end if;

  -- PostgreSQL 17 treats post-15.1 marks as starters. Decompose first, then
  -- perform Unicode 17 canonical ordering and blocked composition ourselves.
  if compatibility then
    normalized_value := normalize(normalized_value, NFKD);
  else
    normalized_value := normalize(normalized_value, NFD);
  end if;

  characters := pg_catalog.string_to_array(normalized_value, null);

  -- Stable insertion sort within every combining-character sequence.
  for character_index in 2..coalesce(
    pg_catalog.cardinality(characters),
    0
  ) loop
    current_character := characters[character_index];
    combining_class := public.vocabulary_unicode_17_combining_class(
      current_character
    );
    reorder_index := character_index;

    while combining_class > 0 and reorder_index > 1 loop
      previous_combining_class :=
        public.vocabulary_unicode_17_combining_class(
          characters[reorder_index - 1]
        );

      exit when previous_combining_class <= combining_class;

      characters[reorder_index] := characters[reorder_index - 1];
      reorder_index := reorder_index - 1;
    end loop;

    characters[reorder_index] := current_character;
  end loop;

  for character_index in 1..coalesce(
    pg_catalog.cardinality(characters),
    0
  ) loop
    current_character := characters[character_index];
    combining_class := public.vocabulary_unicode_17_combining_class(
      current_character
    );
    candidate := null;

    if starter_index is not null
      and (last_combining_class = 0 or last_combining_class < combining_class)
    then
      composition_index := pg_catalog.array_position(
        unicode_17_composition_sources,
        output_characters[starter_index] || current_character
      );

      if composition_index is not null then
        candidate := unicode_17_composition_targets[composition_index];
      else
        previous_value := normalize(
          output_characters[starter_index] || current_character,
          NFC
        );

        if pg_catalog.char_length(previous_value) = 1 then
          candidate := previous_value;
        end if;
      end if;
    end if;

    if candidate is not null then
      output_characters[starter_index] := candidate;
      continue;
    end if;

    output_characters := pg_catalog.array_append(
      output_characters,
      current_character
    );

    if combining_class = 0 then
      starter_index := pg_catalog.cardinality(output_characters);
      last_combining_class := 0;
    else
      last_combining_class := combining_class;
    end if;
  end loop;

  return pg_catalog.array_to_string(output_characters, '');
end;
$$;

revoke execute
on function public.normalize_vocabulary_unicode_17(text, boolean)
from public, anon;

grant execute
on function public.normalize_vocabulary_unicode_17(text, boolean)
to authenticated, service_role;


create function public.normalize_vocabulary_text(
  input_value text,
  input_language text,
  normalize_apostrophes boolean,
  trim_word_edges boolean
)
returns text
language plpgsql
stable
strict
set search_path = ''
as $$
declare
  -- ECMAScript WhiteSpace and LineTerminator code points used by trim().
  trim_characters constant text := U&'\0009\000A\000B\000C\000D\0020\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000\FEFF';
  -- Generated by Node.js 24 / Unicode 17.0 from ECMAScript
  -- [\p{L}\p{M}\p{N}], matching the TypeScript edge-trimming contract.
  word_edge_code_points constant int4multirange := '{
    [48,58), [65,91), [97,123), [170,171), [178,180), [181,182),
    [185,187), [188,191), [192,215), [216,247), [248,706), [710,722),
    [736,741), [748,749), [750,751), [768,885), [886,888), [890,894),
    [895,896), [902,903), [904,907), [908,909), [910,930), [931,1014),
    [1015,1154), [1155,1328), [1329,1367), [1369,1370), [1376,1417), [1425,1470),
    [1471,1472), [1473,1475), [1476,1478), [1479,1480), [1488,1515), [1519,1523),
    [1552,1563), [1568,1642), [1646,1748), [1749,1757), [1759,1769), [1770,1789),
    [1791,1792), [1808,1867), [1869,1970), [1984,2038), [2042,2043), [2045,2046),
    [2048,2094), [2112,2140), [2144,2155), [2160,2184), [2185,2192), [2199,2274),
    [2275,2404), [2406,2416), [2417,2436), [2437,2445), [2447,2449), [2451,2473),
    [2474,2481), [2482,2483), [2486,2490), [2492,2501), [2503,2505), [2507,2511),
    [2519,2520), [2524,2526), [2527,2532), [2534,2546), [2548,2554), [2556,2557),
    [2558,2559), [2561,2564), [2565,2571), [2575,2577), [2579,2601), [2602,2609),
    [2610,2612), [2613,2615), [2616,2618), [2620,2621), [2622,2627), [2631,2633),
    [2635,2638), [2641,2642), [2649,2653), [2654,2655), [2662,2678), [2689,2692),
    [2693,2702), [2703,2706), [2707,2729), [2730,2737), [2738,2740), [2741,2746),
    [2748,2758), [2759,2762), [2763,2766), [2768,2769), [2784,2788), [2790,2800),
    [2809,2816), [2817,2820), [2821,2829), [2831,2833), [2835,2857), [2858,2865),
    [2866,2868), [2869,2874), [2876,2885), [2887,2889), [2891,2894), [2901,2904),
    [2908,2910), [2911,2916), [2918,2928), [2929,2936), [2946,2948), [2949,2955),
    [2958,2961), [2962,2966), [2969,2971), [2972,2973), [2974,2976), [2979,2981),
    [2984,2987), [2990,3002), [3006,3011), [3014,3017), [3018,3022), [3024,3025),
    [3031,3032), [3046,3059), [3072,3085), [3086,3089), [3090,3113), [3114,3130),
    [3132,3141), [3142,3145), [3146,3150), [3157,3159), [3160,3163), [3164,3166),
    [3168,3172), [3174,3184), [3192,3199), [3200,3204), [3205,3213), [3214,3217),
    [3218,3241), [3242,3252), [3253,3258), [3260,3269), [3270,3273), [3274,3278),
    [3285,3287), [3292,3295), [3296,3300), [3302,3312), [3313,3316), [3328,3341),
    [3342,3345), [3346,3397), [3398,3401), [3402,3407), [3412,3428), [3430,3449),
    [3450,3456), [3457,3460), [3461,3479), [3482,3506), [3507,3516), [3517,3518),
    [3520,3527), [3530,3531), [3535,3541), [3542,3543), [3544,3552), [3558,3568),
    [3570,3572), [3585,3643), [3648,3663), [3664,3674), [3713,3715), [3716,3717),
    [3718,3723), [3724,3748), [3749,3750), [3751,3774), [3776,3781), [3782,3783),
    [3784,3791), [3792,3802), [3804,3808), [3840,3841), [3864,3866), [3872,3892),
    [3893,3894), [3895,3896), [3897,3898), [3902,3912), [3913,3949), [3953,3973),
    [3974,3992), [3993,4029), [4038,4039), [4096,4170), [4176,4254), [4256,4294),
    [4295,4296), [4301,4302), [4304,4347), [4348,4681), [4682,4686), [4688,4695),
    [4696,4697), [4698,4702), [4704,4745), [4746,4750), [4752,4785), [4786,4790),
    [4792,4799), [4800,4801), [4802,4806), [4808,4823), [4824,4881), [4882,4886),
    [4888,4955), [4957,4960), [4969,4989), [4992,5008), [5024,5110), [5112,5118),
    [5121,5741), [5743,5760), [5761,5787), [5792,5867), [5870,5881), [5888,5910),
    [5919,5941), [5952,5972), [5984,5997), [5998,6001), [6002,6004), [6016,6100),
    [6103,6104), [6108,6110), [6112,6122), [6128,6138), [6155,6158), [6159,6170),
    [6176,6265), [6272,6315), [6320,6390), [6400,6431), [6432,6444), [6448,6460),
    [6470,6510), [6512,6517), [6528,6572), [6576,6602), [6608,6619), [6656,6684),
    [6688,6751), [6752,6781), [6783,6794), [6800,6810), [6823,6824), [6832,6878),
    [6880,6892), [6912,6989), [6992,7002), [7019,7028), [7040,7156), [7168,7224),
    [7232,7242), [7245,7294), [7296,7307), [7312,7355), [7357,7360), [7376,7379),
    [7380,7419), [7424,7958), [7960,7966), [7968,8006), [8008,8014), [8016,8024),
    [8025,8026), [8027,8028), [8029,8030), [8031,8062), [8064,8117), [8118,8125),
    [8126,8127), [8130,8133), [8134,8141), [8144,8148), [8150,8156), [8160,8173),
    [8178,8181), [8182,8189), [8304,8306), [8308,8314), [8319,8330), [8336,8349),
    [8400,8433), [8450,8451), [8455,8456), [8458,8468), [8469,8470), [8473,8478),
    [8484,8485), [8486,8487), [8488,8489), [8490,8494), [8495,8506), [8508,8512),
    [8517,8522), [8526,8527), [8528,8586), [9312,9372), [9450,9472), [10102,10132),
    [11264,11493), [11499,11508), [11517,11518), [11520,11558), [11559,11560), [11565,11566),
    [11568,11624), [11631,11632), [11647,11671), [11680,11687), [11688,11695), [11696,11703),
    [11704,11711), [11712,11719), [11720,11727), [11728,11735), [11736,11743), [11744,11776),
    [11823,11824), [12293,12296), [12321,12336), [12337,12342), [12344,12349), [12353,12439),
    [12441,12443), [12445,12448), [12449,12539), [12540,12544), [12549,12592), [12593,12687),
    [12690,12694), [12704,12736), [12784,12800), [12832,12842), [12872,12880), [12881,12896),
    [12928,12938), [12977,12992), [13312,19904), [19968,42125), [42192,42238), [42240,42509),
    [42512,42540), [42560,42611), [42612,42622), [42623,42738), [42775,42784), [42786,42889),
    [42891,42973), [42993,43048), [43052,43053), [43056,43062), [43072,43124), [43136,43206),
    [43216,43226), [43232,43256), [43259,43260), [43261,43310), [43312,43348), [43360,43389),
    [43392,43457), [43471,43482), [43488,43519), [43520,43575), [43584,43598), [43600,43610),
    [43616,43639), [43642,43715), [43739,43742), [43744,43760), [43762,43767), [43777,43783),
    [43785,43791), [43793,43799), [43808,43815), [43816,43823), [43824,43867), [43868,43882),
    [43888,44011), [44012,44014), [44016,44026), [44032,55204), [55216,55239), [55243,55292),
    [63744,64110), [64112,64218), [64256,64263), [64275,64280), [64285,64297), [64298,64311),
    [64312,64317), [64318,64319), [64320,64322), [64323,64325), [64326,64434), [64467,64830),
    [64848,64912), [64914,64968), [65008,65020), [65024,65040), [65056,65072), [65136,65141),
    [65142,65277), [65296,65306), [65313,65339), [65345,65371), [65382,65471), [65474,65480),
    [65482,65488), [65490,65496), [65498,65501), [65536,65548), [65549,65575), [65576,65595),
    [65596,65598), [65599,65614), [65616,65630), [65664,65787), [65799,65844), [65856,65913),
    [65930,65932), [66045,66046), [66176,66205), [66208,66257), [66272,66300), [66304,66340),
    [66349,66379), [66384,66427), [66432,66462), [66464,66500), [66504,66512), [66513,66518),
    [66560,66718), [66720,66730), [66736,66772), [66776,66812), [66816,66856), [66864,66916),
    [66928,66939), [66940,66955), [66956,66963), [66964,66966), [66967,66978), [66979,66994),
    [66995,67002), [67003,67005), [67008,67060), [67072,67383), [67392,67414), [67424,67432),
    [67456,67462), [67463,67505), [67506,67515), [67584,67590), [67592,67593), [67594,67638),
    [67639,67641), [67644,67645), [67647,67670), [67672,67703), [67705,67743), [67751,67760),
    [67808,67827), [67828,67830), [67835,67868), [67872,67898), [67904,67930), [67968,68024),
    [68028,68048), [68050,68100), [68101,68103), [68108,68116), [68117,68120), [68121,68150),
    [68152,68155), [68159,68169), [68192,68223), [68224,68256), [68288,68296), [68297,68327),
    [68331,68336), [68352,68406), [68416,68438), [68440,68467), [68472,68498), [68521,68528),
    [68608,68681), [68736,68787), [68800,68851), [68858,68904), [68912,68922), [68928,68966),
    [68969,68974), [68975,68998), [69216,69247), [69248,69290), [69291,69293), [69296,69298),
    [69314,69320), [69370,69416), [69424,69461), [69488,69510), [69552,69580), [69600,69623),
    [69632,69703), [69714,69750), [69759,69819), [69826,69827), [69840,69865), [69872,69882),
    [69888,69941), [69942,69952), [69956,69960), [69968,70004), [70006,70007), [70016,70085),
    [70089,70093), [70094,70107), [70108,70109), [70113,70133), [70144,70162), [70163,70200),
    [70206,70210), [70272,70279), [70280,70281), [70282,70286), [70287,70302), [70303,70313),
    [70320,70379), [70384,70394), [70400,70404), [70405,70413), [70415,70417), [70419,70441),
    [70442,70449), [70450,70452), [70453,70458), [70459,70469), [70471,70473), [70475,70478),
    [70480,70481), [70487,70488), [70493,70500), [70502,70509), [70512,70517), [70528,70538),
    [70539,70540), [70542,70543), [70544,70582), [70583,70593), [70594,70595), [70597,70598),
    [70599,70603), [70604,70612), [70625,70627), [70656,70731), [70736,70746), [70750,70754),
    [70784,70854), [70855,70856), [70864,70874), [71040,71094), [71096,71105), [71128,71134),
    [71168,71233), [71236,71237), [71248,71258), [71296,71353), [71360,71370), [71376,71396),
    [71424,71451), [71453,71468), [71472,71484), [71488,71495), [71680,71739), [71840,71923),
    [71935,71943), [71945,71946), [71948,71956), [71957,71959), [71960,71990), [71991,71993),
    [71995,72004), [72016,72026), [72096,72104), [72106,72152), [72154,72162), [72163,72165),
    [72192,72255), [72263,72264), [72272,72346), [72349,72350), [72368,72441), [72544,72552),
    [72640,72673), [72688,72698), [72704,72713), [72714,72759), [72760,72769), [72784,72813),
    [72818,72848), [72850,72872), [72873,72887), [72960,72967), [72968,72970), [72971,73015),
    [73018,73019), [73020,73022), [73023,73032), [73040,73050), [73056,73062), [73063,73065),
    [73066,73103), [73104,73106), [73107,73113), [73120,73130), [73136,73180), [73184,73194),
    [73440,73463), [73472,73489), [73490,73531), [73534,73539), [73552,73563), [73648,73649),
    [73664,73685), [73728,74650), [74752,74863), [74880,75076), [77712,77809), [77824,78896),
    [78912,78934), [78944,82939), [82944,83527), [90368,90426), [92160,92729), [92736,92767),
    [92768,92778), [92784,92863), [92864,92874), [92880,92910), [92912,92917), [92928,92983),
    [92992,92996), [93008,93018), [93019,93026), [93027,93048), [93053,93072), [93504,93549),
    [93552,93562), [93760,93847), [93856,93881), [93883,93908), [93952,94027), [94031,94088),
    [94095,94112), [94176,94178), [94179,94181), [94192,94199), [94208,101590), [101631,101663),
    [101760,101875), [110576,110580), [110581,110588), [110589,110591), [110592,110883), [110898,110899),
    [110928,110931), [110933,110934), [110948,110952), [110960,111356), [113664,113771), [113776,113789),
    [113792,113801), [113808,113818), [113821,113823), [118000,118010), [118528,118574), [118576,118599),
    [119141,119146), [119149,119155), [119163,119171), [119173,119180), [119210,119214), [119362,119365),
    [119488,119508), [119520,119540), [119648,119673), [119808,119893), [119894,119965), [119966,119968),
    [119970,119971), [119973,119975), [119977,119981), [119982,119994), [119995,119996), [119997,120004),
    [120005,120070), [120071,120075), [120077,120085), [120086,120093), [120094,120122), [120123,120127),
    [120128,120133), [120134,120135), [120138,120145), [120146,120486), [120488,120513), [120514,120539),
    [120540,120571), [120572,120597), [120598,120629), [120630,120655), [120656,120687), [120688,120713),
    [120714,120745), [120746,120771), [120772,120780), [120782,120832), [121344,121399), [121403,121453),
    [121461,121462), [121476,121477), [121499,121504), [121505,121520), [122624,122655), [122661,122667),
    [122880,122887), [122888,122905), [122907,122914), [122915,122917), [122918,122923), [122928,122990),
    [123023,123024), [123136,123181), [123184,123198), [123200,123210), [123214,123215), [123536,123567),
    [123584,123642), [124112,124154), [124368,124411), [124608,124639), [124640,124662), [124670,124672),
    [124896,124903), [124904,124908), [124909,124911), [124912,124927), [124928,125125), [125127,125143),
    [125184,125260), [125264,125274), [126065,126124), [126125,126128), [126129,126133), [126209,126254),
    [126255,126270), [126464,126468), [126469,126496), [126497,126499), [126500,126501), [126503,126504),
    [126505,126515), [126516,126520), [126521,126522), [126523,126524), [126530,126531), [126535,126536),
    [126537,126538), [126539,126540), [126541,126544), [126545,126547), [126548,126549), [126551,126552),
    [126553,126554), [126555,126556), [126557,126558), [126559,126560), [126561,126563), [126564,126565),
    [126567,126571), [126572,126579), [126580,126584), [126585,126589), [126590,126591), [126592,126602),
    [126603,126620), [126625,126628), [126629,126634), [126635,126652), [127232,127245), [130032,130042),
    [131072,173792), [173824,178206), [178208,183982), [183984,191457), [191472,192094), [194560,195102),
    [196608,201547), [201552,210042), [917760,918000)
  }'::int4multirange;
  characters text[];
  collation_name name;
  end_index integer;
  normalized_word text;
  primary_language text;
  start_index integer := 1;
begin
  normalized_word := public.normalize_vocabulary_unicode_17(
    pg_catalog.btrim(input_value, trim_characters),
    true
  );
  if normalize_apostrophes then
    normalized_word := pg_catalog.translate(
      normalized_word,
      U&'\2018\2019\02BC',
      U&'\0027\0027\0027'
    );
  end if;

  primary_language := pg_catalog.split_part(
    pg_catalog.lower(pg_catalog.btrim(input_language)),
    '-',
    1
  );

  select collations.collname
  into collation_name
  from pg_catalog.pg_collation as collations
  where collations.collprovider = 'i'
    and collations.collname = primary_language || '-x-icu'
  limit 1;

  if collation_name is null then
    collation_name := 'und-x-icu';
  end if;

  execute pg_catalog.format(
    'select pg_catalog.lower($1 collate pg_catalog.%I)',
    collation_name
  )
  into normalized_word
  using normalized_word;

  -- ICU shipped with PostgreSQL does not know these Unicode 16/17 case pairs.
  normalized_word := pg_catalog.translate(
    normalized_word,
    U&'\1C89\A7CB\A7CC\A7CE\A7D2\A7D4\A7DA\A7DC\+010D50\+010D51\+010D52\+010D53\+010D54\+010D55\+010D56\+010D57\+010D58\+010D59\+010D5A\+010D5B\+010D5C\+010D5D\+010D5E\+010D5F\+010D60\+010D61\+010D62\+010D63\+010D64\+010D65\+016EA0\+016EA1\+016EA2\+016EA3\+016EA4\+016EA5\+016EA6\+016EA7\+016EA8\+016EA9\+016EAA\+016EAB\+016EAC\+016EAD\+016EAE\+016EAF\+016EB0\+016EB1\+016EB2\+016EB3\+016EB4\+016EB5\+016EB6\+016EB7\+016EB8',
    U&'\1C8A\0264\A7CD\A7CF\A7D3\A7D5\A7DB\019B\+010D70\+010D71\+010D72\+010D73\+010D74\+010D75\+010D76\+010D77\+010D78\+010D79\+010D7A\+010D7B\+010D7C\+010D7D\+010D7E\+010D7F\+010D80\+010D81\+010D82\+010D83\+010D84\+010D85\+016EBB\+016EBC\+016EBD\+016EBE\+016EBF\+016EC0\+016EC1\+016EC2\+016EC3\+016EC4\+016EC5\+016EC6\+016EC7\+016EC8\+016EC9\+016ECA\+016ECB\+016ECC\+016ECD\+016ECE\+016ECF\+016ED0\+016ED1\+016ED2\+016ED3'
  );

  if trim_word_edges then
    characters := pg_catalog.string_to_array(normalized_word, null);
    end_index := pg_catalog.cardinality(characters);

    while start_index <= end_index
      and not (
        pg_catalog.ascii(characters[start_index]) <@ word_edge_code_points
      )
    loop
      start_index := start_index + 1;
    end loop;

    while end_index >= start_index
      and not (
        pg_catalog.ascii(characters[end_index]) <@ word_edge_code_points
      )
    loop
      end_index := end_index - 1;
    end loop;

    normalized_word := pg_catalog.array_to_string(
      characters[start_index:end_index],
      ''
    );
  end if;

  return public.normalize_vocabulary_unicode_17(normalized_word, false);
end;
$$;

revoke execute
on function public.normalize_vocabulary_text(text, text, boolean, boolean)
from public, anon;

grant execute
on function public.normalize_vocabulary_text(text, text, boolean, boolean)
to authenticated, service_role;

create function public.normalize_vocabulary_word(
  input_word text,
  input_source_language text
)
returns text
language sql
stable
strict
set search_path = ''
return public.normalize_vocabulary_text(
  input_word,
  input_source_language,
  true,
  true
);

revoke execute
on function public.normalize_vocabulary_word(text, text)
from public, anon;

grant execute
on function public.normalize_vocabulary_word(text, text)
to authenticated, service_role;

-- Hold one write boundary from the backfill snapshot through trigger creation.
lock table public.vocabulary_cards in share row exclusive mode;

create temporary table vocabulary_card_normalization_plan
on commit drop
as
with normalized_cards as (
  select
    cards.*,
    public.normalize_vocabulary_word(
      cards.word,
      cards.source_language
    ) as normalized_word
  from public.vocabulary_cards as cards
)
select
  normalized_cards.id,
  normalized_cards.normalized_word,
  pg_catalog.first_value(normalized_cards.id) over card_group as survivor_id,
  pg_catalog.row_number() over card_group as card_priority,
  pg_catalog.count(*) over card_group as card_count,
  pg_catalog.min(normalized_cards.created_at) over card_group as earliest_created_at
from normalized_cards
window card_group as (
  partition by
    normalized_cards.user_id,
    normalized_cards.source_language,
    normalized_cards.target_language,
    normalized_cards.normalized_word
  order by
    normalized_cards.updated_at desc,
    normalized_cards.created_at desc,
    normalized_cards.id desc
  rows between unbounded preceding and unbounded following
);

do $$
begin
  if exists (
    select 1
    from vocabulary_card_normalization_plan as normalization_plan
    where normalization_plan.normalized_word = ''
  ) then
    raise exception using
      errcode = '23514',
      message = 'A vocabulary card cannot normalize to an empty word.';
  end if;

end;
$$;

create temporary table vocabulary_card_merged_translations
on commit drop
as
select
  meanings_by_key.survivor_id,
  pg_catalog.array_agg(
    meanings_by_key.display_value
    order by
      meanings_by_key.first_card_priority,
      meanings_by_key.first_position
  ) as translation
from (
  select
    normalization_plan.survivor_id,
    (
      pg_catalog.array_agg(
        pg_catalog.btrim(meanings.value)
        order by normalization_plan.card_priority, meanings.position
      )
    )[1] as display_value,
    pg_catalog.min(normalization_plan.card_priority) as first_card_priority,
    (
      pg_catalog.array_agg(
        meanings.position
        order by normalization_plan.card_priority, meanings.position
      )
    )[1] as first_position
  from vocabulary_card_normalization_plan as normalization_plan
  join public.vocabulary_cards as cards
    on cards.id = normalization_plan.id
  cross join lateral pg_catalog.unnest(cards.translation)
    with ordinality as meanings(value, position)
  group by
    normalization_plan.survivor_id,
    public.normalize_vocabulary_text(
      meanings.value,
      cards.target_language,
      false,
      false
    )
) as meanings_by_key
group by meanings_by_key.survivor_id;

do $$
begin
  if exists (
    select 1
    from vocabulary_card_normalization_plan as normalization_plan
    join public.vocabulary_cards as cards
      on cards.id = normalization_plan.survivor_id
    join vocabulary_card_merged_translations as merged_translations
      on merged_translations.survivor_id = normalization_plan.survivor_id
    where normalization_plan.id = normalization_plan.survivor_id
      and pg_catalog.cardinality(merged_translations.translation) > 10
      and (
        normalization_plan.card_count > 1
        or cards.word is distinct from normalization_plan.normalized_word
        or cards.translation is distinct from merged_translations.translation
        or cards.created_at is distinct from normalization_plan.earliest_created_at
      )
  ) then
    raise exception using
      errcode = '23514',
      message = 'Normalized vocabulary card duplicates exceed the ten-meaning limit.';
  end if;
end;
$$;

delete from public.vocabulary_cards as cards
using vocabulary_card_normalization_plan as normalization_plan
where cards.id = normalization_plan.id
  and normalization_plan.id <> normalization_plan.survivor_id;

update public.vocabulary_cards as cards
set
  word = normalization_plan.normalized_word,
  translation = merged_translations.translation,
  created_at = normalization_plan.earliest_created_at
from vocabulary_card_normalization_plan as normalization_plan
join vocabulary_card_merged_translations as merged_translations
  on merged_translations.survivor_id = normalization_plan.survivor_id
where cards.id = normalization_plan.survivor_id
  and normalization_plan.id = normalization_plan.survivor_id
  and (
    cards.word is distinct from normalization_plan.normalized_word
    or cards.translation is distinct from merged_translations.translation
    or cards.created_at is distinct from normalization_plan.earliest_created_at
  );

create function public.normalize_vocabulary_card_word()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.word := public.normalize_vocabulary_word(
    new.word,
    new.source_language
  );

  return new;
end;
$$;

revoke execute
on function public.normalize_vocabulary_card_word()
from public;

create trigger vocabulary_cards_normalize_word
before insert or update of word, source_language
on public.vocabulary_cards
for each row
execute function public.normalize_vocabulary_card_word();
