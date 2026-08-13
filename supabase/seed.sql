-- ==============================================================================
-- StudyOS Curriculum Seed Script
-- Description: Helper function and seed dataset to provision the initial
--              DSA, Java, Machine Learning, and SQL curriculum for an authenticated user.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.seed_user_curriculum(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_sub_dsa UUID;
  v_sub_java UUID;
  v_sub_ml UUID;
  v_sub_sql UUID;
  
  v_top_dsa_recursion UUID;
  v_top_dsa_arrays UUID;
  v_top_dsa_trees UUID;
  v_top_dsa_dp UUID;
  
  v_top_java_collections UUID;
  v_top_java_multithreading UUID;
  v_top_java_streams UUID;
  
  v_top_ml_supervised UUID;
  v_top_ml_deep UUID;
  v_top_ml_evaluation UUID;
  
  v_top_sql_joins UUID;
  v_top_sql_indexing UUID;
  v_top_sql_window UUID;
BEGIN
  -- ── 1. SUBJECT: DSA ────────────────────────────────────────────────────────
  INSERT INTO public.subjects (user_id, name, description, category, color, target_date)
  VALUES (p_user_id, 'DSA', 'Data Structures and Algorithms for technical interviews and problem solving.', 'Computer Science', '#22d3ee', '2026-10-31')
  RETURNING id INTO v_sub_dsa;

  -- DSA Topics
  INSERT INTO public.topics (subject_id, name, description, display_order)
  VALUES (v_sub_dsa, 'Recursion & Backtracking', 'Call stack mechanics, base cases, recursion trees, and backtracking search.', 1)
  RETURNING id INTO v_top_dsa_recursion;

  INSERT INTO public.topics (subject_id, name, description, display_order)
  VALUES (v_sub_dsa, 'Arrays & Binary Search', 'Two pointers, sliding window, prefix sums, binary search in rotated arrays.', 2)
  RETURNING id INTO v_top_dsa_arrays;

  INSERT INTO public.topics (subject_id, name, description, display_order)
  VALUES (v_sub_dsa, 'Trees & Graphs', 'DFS, BFS, Binary Search Trees, LCA, graph traversals, and topological sorting.', 3)
  RETURNING id INTO v_top_dsa_trees;

  INSERT INTO public.topics (subject_id, name, description, display_order)
  VALUES (v_sub_dsa, 'Dynamic Programming', 'Optimal substructure, memoization, bottom-up tabulation, 1D and 2D DP patterns.', 4)
  RETURNING id INTO v_top_dsa_dp;

  -- DSA Learning Items
  INSERT INTO public.learning_items (topic_id, title, description, display_order, status, priority, estimated_minutes, resources) VALUES
  (v_top_dsa_recursion, 'Understand Base Cases & Call Stack', 'Analyze call stack depth, space complexity, and stack overflow conditions.', 1, 'NOT_STARTED', 'HIGH', 45, '[{"id":"r-1","type":"notes","title":"NeetCode Recursion Guide"}]'::jsonb),
  (v_top_dsa_recursion, 'Implement Factorial Recursively', 'Standard recursive factorial with mathematical induction analysis.', 2, 'NOT_STARTED', 'MEDIUM', 30, '[{"id":"r-2","type":"practice","title":"LeetCode Practice"}]'::jsonb),
  (v_top_dsa_recursion, 'Fibonacci with Memoization', 'Top-down caching using array memoization to reduce complexity from 2^n to O(n).', 3, 'NOT_STARTED', 'HIGH', 45, '[{"id":"r-3","type":"practice","title":"LeetCode 509"}]'::jsonb),
  (v_top_dsa_recursion, 'Reverse an Array using Recursion', 'In-place two-pointer recursive swap technique.', 4, 'NOT_STARTED', 'MEDIUM', 30, '[{"id":"r-4","type":"practice","title":"GFG Recursion"}]'::jsonb),
  (v_top_dsa_recursion, 'Tower of Hanoi', 'Classic recursive problem with 3 pegs; formula 2^n - 1 moves.', 5, 'NOT_STARTED', 'HIGH', 60, '[{"id":"r-5","type":"video","title":"Abdul Bari Lecture"}]'::jsonb),
  (v_top_dsa_recursion, 'Subsets / Subsequences Generation', 'Include/exclude pattern generating all 2^n power set elements.', 6, 'NOT_STARTED', 'HIGH', 60, '[{"id":"r-6","type":"practice","title":"LeetCode 78"}]'::jsonb),
  (v_top_dsa_recursion, 'String Permutations', 'Backtracking with visited boolean array vs swapping elements in-place.', 7, 'NOT_STARTED', 'HIGH', 75, '[{"id":"r-7","type":"practice","title":"LeetCode 46"}]'::jsonb),
  (v_top_dsa_recursion, 'Recursion vs Iteration Trade-offs', 'Comparative analysis of overhead, stack space, and readability.', 8, 'NOT_STARTED', 'LOW', 30, '[{"id":"r-8","type":"notes","title":"System Design Notes"}]'::jsonb),

  (v_top_dsa_arrays, 'Search in Rotated Sorted Array', 'Modified binary search checking which half is sorted.', 1, 'NOT_STARTED', 'HIGH', 60, '[{"id":"r-9","type":"practice","title":"LeetCode 33"}]'::jsonb),
  (v_top_dsa_arrays, 'Find Peak Element', 'Logarithmic search finding local maximum in unsorted array.', 2, 'NOT_STARTED', 'MEDIUM', 45, '[{"id":"r-10","type":"practice","title":"LeetCode 162"}]'::jsonb),
  (v_top_dsa_arrays, 'Sliding Window Maximum', 'Monotonic decreasing deque to maintain window maximum in linear time.', 3, 'NOT_STARTED', 'HIGH', 90, '[{"id":"r-11","type":"practice","title":"LeetCode 239"}]'::jsonb),

  (v_top_dsa_trees, 'Lowest Common Ancestor in BST', 'Tree traversal leveraging BST ordered property.', 1, 'NOT_STARTED', 'HIGH', 45, '[{"id":"r-12","type":"practice","title":"LeetCode 235"}]'::jsonb),
  (v_top_dsa_trees, 'Binary Tree Level Order Traversal', 'Queue-based BFS traversal grouping nodes by depth levels.', 2, 'NOT_STARTED', 'MEDIUM', 45, '[{"id":"r-13","type":"practice","title":"LeetCode 102"}]'::jsonb),

  (v_top_dsa_dp, 'Climbing Stairs', 'Fibonacci transition relation for 1 or 2 step choices.', 1, 'NOT_STARTED', 'MEDIUM', 30, '[{"id":"r-14","type":"practice","title":"LeetCode 70"}]'::jsonb),
  (v_top_dsa_dp, '0/1 Knapsack Problem', 'Standard 2D dynamic programming knapsack with weight capacity constraints.', 2, 'NOT_STARTED', 'HIGH', 90, '[{"id":"r-15","type":"notes","title":"DP Patterns"}]'::jsonb);

  -- ── 2. SUBJECT: Java ───────────────────────────────────────────────────────
  INSERT INTO public.subjects (user_id, name, description, category, color, target_date)
  VALUES (p_user_id, 'Java', 'Core Java, JVM internals, Collections, Concurrency, and modern Java features.', 'Backend Engineering', '#f97316', '2026-11-15')
  RETURNING id INTO v_sub_java;

  -- Java Topics
  INSERT INTO public.topics (subject_id, name, description, display_order)
  VALUES (v_sub_java, 'Collections Framework', 'List, Set, Map hierarchies, internal hashmap mechanics, tree sets, and iteration.', 1)
  RETURNING id INTO v_top_java_collections;

  INSERT INTO public.topics (subject_id, name, description, display_order)
  VALUES (v_sub_java, 'Multithreading & Concurrency', 'Thread lifecycle, synchronization, locks, volatile, and ExecutorService.', 2)
  RETURNING id INTO v_top_java_multithreading;

  INSERT INTO public.topics (subject_id, name, description, display_order)
  VALUES (v_sub_java, 'Streams & Lambdas (Java 8+)', 'Functional interfaces, stream pipelines, collectors, optionals, and parallel streams.', 3)
  RETURNING id INTO v_top_java_streams;

  -- Java Learning Items
  INSERT INTO public.learning_items (topic_id, title, description, display_order, status, priority, estimated_minutes, resources) VALUES
  (v_top_java_collections, 'HashMap Internal Implementation', 'Array of buckets, hash collision resolution, load factor, and treeification in Java 8.', 1, 'NOT_STARTED', 'HIGH', 60, '[{"id":"rj-1","type":"notes","title":"JVM Deep Dive"}]'::jsonb),
  (v_top_java_collections, 'ArrayList vs LinkedList Benchmarks', 'Memory locality, random access performance, and insertion costs.', 2, 'NOT_STARTED', 'MEDIUM', 45, '[{"id":"rj-2","type":"practice","title":"JMH Benchmarking"}]'::jsonb),
  (v_top_java_collections, 'ConcurrentHashMap Architecture', 'Segment locking vs CAS bucket locking, counter cells, and thread-safe traversal.', 3, 'NOT_STARTED', 'HIGH', 75, '[{"id":"rj-3","type":"notes","title":"Java Concurrency in Practice"}]'::jsonb),
  (v_top_java_collections, 'Comparable vs Comparator Interfaces', 'Natural ordering vs custom dynamic sorting with lambdas and method references.', 4, 'NOT_STARTED', 'LOW', 30, '[{"id":"rj-4","type":"practice","title":"Core Java Exercises"}]'::jsonb),

  (v_top_java_multithreading, 'Volatile Keyword & Memory Model', 'Visibility guarantees, instruction reordering prevention, and happens-before relationships.', 1, 'NOT_STARTED', 'HIGH', 60, '[{"id":"rj-5","type":"video","title":"JMM Explanation"}]'::jsonb),
  (v_top_java_multithreading, 'ExecutorService & ThreadPoolExecutor', 'Core pool size, maximum pool size, work queue types, and rejection execution policies.', 2, 'NOT_STARTED', 'HIGH', 75, '[{"id":"rj-6","type":"practice","title":"Concurrency Lab"}]'::jsonb),

  (v_top_java_streams, 'Stream Intermediate vs Terminal Operations', 'Lazy evaluation, filter, map, flatMap, and short-circuiting operations.', 1, 'NOT_STARTED', 'MEDIUM', 45, '[{"id":"rj-7","type":"practice","title":"Java 8 Stream Katas"}]'::jsonb),
  (v_top_java_streams, 'Custom Collectors & GroupingBy', 'Advanced aggregation pipelines, downstream collectors, and partition mapping.', 2, 'NOT_STARTED', 'HIGH', 60, '[{"id":"rj-8","type":"practice","title":"Stream Collector Workshop"}]'::jsonb);

  -- ── 3. SUBJECT: Machine Learning ──────────────────────────────────────────
  INSERT INTO public.subjects (user_id, name, description, category, color, target_date)
  VALUES (p_user_id, 'Machine Learning', 'Statistical foundations, classical supervised/unsupervised models, and deep learning.', 'Data Science & AI', '#a78bfa', '2026-12-31')
  RETURNING id INTO v_sub_ml;

  -- ML Topics
  INSERT INTO public.topics (subject_id, name, description, display_order)
  VALUES (v_sub_ml, 'Supervised Learning Algorithms', 'Linear regression, logistic regression, SVMs, decision trees, and ensemble techniques.', 1)
  RETURNING id INTO v_top_ml_supervised;

  INSERT INTO public.topics (subject_id, name, description, display_order)
  VALUES (v_sub_ml, 'Deep Learning Foundations', 'Perceptrons, backpropagation, activation functions, regularization, and optimization.', 2)
  RETURNING id INTO v_top_ml_deep;

  INSERT INTO public.topics (subject_id, name, description, display_order)
  VALUES (v_sub_ml, 'Model Evaluation & Validation', 'Confusion matrices, precision/recall, ROC-AUC curves, cross-validation, and bias-variance.', 3)
  RETURNING id INTO v_top_ml_evaluation;

  -- ML Learning Items
  INSERT INTO public.learning_items (topic_id, title, description, display_order, status, priority, estimated_minutes, resources) VALUES
  (v_top_ml_supervised, 'Linear Regression with Gradient Descent', 'Cost function minimization, learning rate tuning, and vectorization in NumPy.', 1, 'NOT_STARTED', 'HIGH', 60, '[{"id":"rm-1","type":"notes","title":"Andrew Ng ML Notes"}]'::jsonb),
  (v_top_ml_supervised, 'Random Forest & Bagging Ensembles', 'Bootstrapping samples, feature subsampling, out-of-bag error estimation.', 2, 'NOT_STARTED', 'HIGH', 75, '[{"id":"rm-2","type":"practice","title":"Scikit-Learn Tutorial"}]'::jsonb),
  (v_top_ml_supervised, 'Gradient Boosted Trees (XGBoost / LightGBM)', 'Residual fitting, shrinkage rate, tree depth regularization, and loss gradients.', 3, 'NOT_STARTED', 'HIGH', 90, '[{"id":"rm-3","type":"practice","title":"Kaggle Tabular Playground"}]'::jsonb),

  (v_top_ml_deep, 'Backpropagation Calculus & Computational Graphs', 'Chain rule applications, forward pass caching, and gradient flow mechanics.', 1, 'NOT_STARTED', 'HIGH', 90, '[{"id":"rm-4","type":"video","title":"3Blue1Brown Neural Networks"}]'::jsonb),
  (v_top_ml_deep, 'Adam Optimizer Mechanics', 'Combining momentum and RMSProp with exponential moving averages of gradients.', 2, 'NOT_STARTED', 'MEDIUM', 60, '[{"id":"rm-5","type":"notes","title":"Deep Learning Book (Goodfellow)"}]'::jsonb),

  (v_top_ml_evaluation, 'Precision, Recall & F1-Score in Imbalanced Data', 'Threshold tuning, PR curves vs ROC curves for skewed classification datasets.', 1, 'NOT_STARTED', 'HIGH', 45, '[{"id":"rm-6","type":"practice","title":"Scikit-Learn Evaluation"}]'::jsonb);

  -- ── 4. SUBJECT: SQL ────────────────────────────────────────────────────────
  INSERT INTO public.subjects (user_id, name, description, category, color, target_date)
  VALUES (p_user_id, 'SQL', 'Complete Structured Query Language (SQL) 38-lecture mastery course.', 'Database Systems', '#34d399', '2026-09-30')
  RETURNING id INTO v_sub_sql;

  -- Seed the complete 38-lecture SQL curriculum
  PERFORM public.seed_sql_curriculum(p_user_id, v_sub_sql);

  -- ── 5. SUBJECT: Object Oriented Programming ──────────────────────────────────
  INSERT INTO public.subjects (user_id, name, description, category, color, target_date)
  VALUES (p_user_id, 'Object Oriented Programming', 'Object Oriented Programming principles, design patterns, generics & collections.', 'Software Architecture', '#ec4899', '2026-10-15')
  RETURNING id INTO v_sub_sql;

  PERFORM public.seed_oop_curriculum(p_user_id, v_sub_sql);

  -- ── 6. SUBJECT: Operating Systems ─────────────────────────────────────────
  INSERT INTO public.subjects (user_id, name, description, category, color, target_date)
  VALUES (p_user_id, 'Operating Systems', 'Process management, CPU scheduling, deadlocks, memory management & disk scheduling.', 'Computer Science', '#3b82f6', '2026-11-30')
  RETURNING id INTO v_sub_sql;

  PERFORM public.seed_os_curriculum(p_user_id, v_sub_sql);

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
