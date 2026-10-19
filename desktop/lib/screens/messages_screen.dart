import 'package:flutter/material.dart';

class MessagesScreen extends StatefulWidget {
  final String userName;

  const MessagesScreen({
    super.key,
    this.userName = '',
  });

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  String get _mySenderName =>
      widget.userName.isNotEmpty ? 'Moi (${widget.userName})' : 'Moi';

  int _activeChatIndex = 0;
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  String _searchQuery = '';

  final List<Map<String, dynamic>> _conversations = [
    {
      'id': 'conv-1',
      'name': 'Génie Logiciel (INF4067) · Groupe L3 ICT4D',
      'type': 'channel',
      'lastMessage': 'Prof. Melatagia : Le dépôt du TP 2 est prolongé jusqu’à vendredi 23h59.',
      'time': '14:32',
      'unread': 3,
      'avatar': 'assets/icons/nav/courses.png',
      'online': true,
      'messages': [
        {
          'sender': 'Prof. Melatagia Yonta',
          'isMe': false,
          'text': 'Bonjour à tous. N’oubliez pas de tester vos microservices avec les conteneurs Docker fournis.',
          'time': '10:15',
          'attachment': null,
        },
        {
          'sender': 'Ravel Nghomsi',
          'isMe': false,
          'text': 'Bien reçu Monsieur, le pipeline CI/CD valide déjà les images.',
          'time': '11:20',
          'attachment': null,
        },
        {
          'sender': 'Moi',
          'isMe': true,
          'text': 'Est-ce que le rapport PDF doit inclure les métriques de couverture Drift ?',
          'time': '14:10',
          'attachment': null,
        },
        {
          'sender': 'Prof. Melatagia Yonta',
          'isMe': false,
          'text': 'Le dépôt du TP 2 est prolongé jusqu’à vendredi 23h59. Oui, incluez le rapport de couverture.',
          'time': '14:32',
          'attachment': 'tp2_specifications_lmd.pdf',
        },
      ],
    },
    {
      'id': 'conv-2',
      'name': 'Ravel Nghomsi (Lead KERNEL FORGE)',
      'type': 'direct',
      'lastMessage': 'Le build desktop fonctionne nickel avec les flux LiveKit locaux.',
      'time': '13:45',
      'unread': 0,
      'avatar': 'assets/illustrations/photo_1_2026-10-02_13-20-47.jpg',
      'online': true,
      'messages': [
        {
          'sender': 'Ravel Nghomsi',
          'isMe': false,
          'text': 'Salut, tu as pu vérifier le streaming direct Z-Library vers le bucket Appwrite ?',
          'time': '12:00',
          'attachment': null,
        },
        {
          'sender': 'Moi',
          'isMe': true,
          'text': 'Oui, plus aucun fichier n\'est écrit sur le disque du VPS. Tout est streamé en mémoire directement vers Appwrite Storage.',
          'time': '12:40',
          'attachment': null,
        },
        {
          'sender': 'Ravel Nghomsi',
          'isMe': false,
          'text': 'Le build desktop fonctionne nickel avec les flux LiveKit locaux.',
          'time': '13:45',
          'attachment': null,
        },
      ],
    },
    {
      'id': 'conv-3',
      'name': 'Sécurité Informatique (INF4077)',
      'type': 'channel',
      'lastMessage': 'Dr. Tapamo : Rappel, le TD sur les courbes elliptiques se tiendra au Lab C205.',
      'time': '11:05',
      'unread': 1,
      'avatar': 'assets/icons/nav/attendance.png',
      'online': false,
      'messages': [
        {
          'sender': 'Dr. Tapamo',
          'isMe': false,
          'text': 'Rappel, le TD sur les courbes elliptiques se tiendra au Lab C205.',
          'time': '11:05',
          'attachment': 'td_cryptographie_ecc.pdf',
        },
      ],
    },
    {
      'id': 'conv-4',
      'name': 'Sandra Febnchak (Frontend UI/UX)',
      'type': 'direct',
      'lastMessage': 'J\'ai mis à jour les Hero Bento sur les pages mobiles !',
      'time': 'Hier',
      'unread': 0,
      'avatar': 'assets/illustrations/photo_3_2026-10-02_13-20-47.jpg',
      'online': true,
      'messages': [
        {
          'sender': 'Sandra Febnchak',
          'isMe': false,
          'text': 'J\'ai mis à jour les Hero Bento sur les pages mobiles ! Vérifie si le layout desktop est synchro.',
          'time': 'Hier 18:20',
          'attachment': null,
        },
        {
          'sender': 'Moi',
          'isMe': true,
          'text': 'Superbe boulot Sandra, le design system est 100% cohérent.',
          'time': 'Hier 19:05',
          'attachment': null,
        },
      ],
    },
    {
      'id': 'conv-5',
      'name': 'Hassane Youssouf (Backend Lead)',
      'type': 'direct',
      'lastMessage': 'Le cluster PostgreSQL BaaS a été scalé pour absorber la rentrée.',
      'time': 'Hier',
      'unread': 0,
      'avatar': 'assets/illustrations/photo_2_2026-10-02_13-20-47.jpg',
      'online': false,
      'messages': [
        {
          'sender': 'Hassane Youssouf',
          'isMe': false,
          'text': 'Le cluster PostgreSQL BaaS a été scalé pour absorber la rentrée.',
          'time': 'Hier 15:30',
          'attachment': null,
        },
      ],
    },
  ];

  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      final activeChat = _conversations[_activeChatIndex];
      (activeChat['messages'] as List<Map<String, dynamic>>).add({
        'sender': _mySenderName,
        'isMe': true,
        'text': text,
        'time': 'Maintenant',
        'attachment': null,
      });
      activeChat['lastMessage'] = 'Moi: $text';
      activeChat['time'] = 'Maintenant';
      _messageController.clear();
    });

    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final filteredConversations = _conversations.where((conv) {
      final name = conv['name'].toString().toLowerCase();
      final lastMsg = conv['lastMessage'].toString().toLowerCase();
      final q = _searchQuery.toLowerCase();
      return name.contains(q) || lastMsg.contains(q);
    }).toList();

    final activeChat = _conversations[_activeChatIndex];
    final List<Map<String, dynamic>> messages = activeChat['messages'];

    return Container(
      color: const Color(0xFF0B132B),
      child: Column(
        children: [
          // Header Bento de la messagerie
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF0B132B), Color(0xFF1E3A8A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Image.asset(
                    'assets/icons/nav/messages.png',
                    width: 28,
                    height: 28,
                    fit: BoxFit.contain,
                  ),
                ),
                const SizedBox(width: 14),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Messagerie Instantanée P2P & Canaux Campus UY1',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Discussions directes avec les étudiants, délégués et enseignants · Chiffrement de bout en bout',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11.5),
                    ),
                  ],
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.wifi_tethering_rounded, color: Color(0xFF34D399), size: 14),
                      SizedBox(width: 6),
                      Text('Canaux Actifs', style: TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Split-Pane : Liste des conversations à gauche + Fenêtre de discussion à droite
          Expanded(
            child: Row(
              children: [
                // =============================================================
                // COLONNE GAUCHE : LISTE DES CANAUX & CONTACTS (340px)
                // =============================================================
                Container(
                  width: 360,
                  decoration: const BoxDecoration(
                    color: Color(0xFF0F172A),
                    border: Border(right: BorderSide(color: Color(0xFF1E293B))),
                  ),
                  child: Column(
                    children: [
                      // Barre de recherche
                      Padding(
                        padding: const EdgeInsets.all(14),
                        child: TextField(
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          onChanged: (v) => setState(() => _searchQuery = v),
                          decoration: InputDecoration(
                            hintText: 'Rechercher un canal ou un contact...',
                            hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                            prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF64748B), size: 18),
                            filled: true,
                            fillColor: const Color(0xFF1E293B),
                            contentPadding: const EdgeInsets.symmetric(vertical: 10),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),

                      // Liste des discussions
                      Expanded(
                        child: ListView.builder(
                          itemCount: filteredConversations.length,
                          itemBuilder: (context, index) {
                            final conv = filteredConversations[index];
                            final isSelected = _conversations.indexOf(conv) == _activeChatIndex;
                            final isChannel = conv['type'] == 'channel';

                            return InkWell(
                              onTap: () {
                                setState(() {
                                  _activeChatIndex = _conversations.indexOf(conv);
                                  conv['unread'] = 0;
                                });
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                decoration: BoxDecoration(
                                  color: isSelected ? const Color(0xFF1E293B) : Colors.transparent,
                                  border: Border(
                                    left: BorderSide(
                                      color: isSelected ? const Color(0xFF0D9488) : Colors.transparent,
                                      width: 4,
                                    ),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Stack(
                                      children: [
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(14),
                                          child: Image.asset(
                                            conv['avatar'] as String,
                                            width: 44,
                                            height: 44,
                                            fit: BoxFit.cover,
                                            errorBuilder: (_, __, ___) => Container(
                                              width: 44,
                                              height: 44,
                                              color: const Color(0xFF334155),
                                              child: Icon(
                                                isChannel ? Icons.tag_rounded : Icons.person_rounded,
                                                color: Colors.white,
                                              ),
                                            ),
                                          ),
                                        ),
                                        if (conv['online'] == true)
                                          Positioned(
                                            bottom: 0,
                                            right: 0,
                                            child: Container(
                                              width: 12,
                                              height: 12,
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF10B981),
                                                shape: BoxShape.circle,
                                                border: Border.all(color: const Color(0xFF0F172A), width: 2),
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  conv['name'] as String,
                                                  style: TextStyle(
                                                    color: isSelected ? Colors.white : const Color(0xFFE2E8F0),
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 12.5,
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              Text(
                                                conv['time'] as String,
                                                style: const TextStyle(color: Color(0xFF64748B), fontSize: 10.5),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 3),
                                          Text(
                                            conv['lastMessage'] as String,
                                            style: TextStyle(
                                              color: (conv['unread'] as int) > 0
                                                  ? const Color(0xFF67E8F9)
                                                  : const Color(0xFF94A3B8),
                                              fontSize: 11.5,
                                              fontWeight: (conv['unread'] as int) > 0 ? FontWeight.bold : FontWeight.normal,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                    ),
                                    if ((conv['unread'] as int) > 0) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF0D9488),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          '${conv['unread']}',
                                          style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),

                // =============================================================
                // COLONNE DROITE : CONVERSATION ACTIVE & COMPOSITEUR
                // =============================================================
                Expanded(
                  child: Container(
                    color: const Color(0xFF0B132B),
                    child: Column(
                      children: [
                        // En-tête de la discussion
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                          decoration: const BoxDecoration(
                            color: Color(0xFF0F172A),
                            border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
                          ),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.asset(
                                  activeChat['avatar'] as String,
                                  width: 38,
                                  height: 38,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 38,
                                    height: 38,
                                    color: const Color(0xFF334155),
                                    child: const Icon(Icons.chat_bubble_rounded, color: Colors.white),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      activeChat['name'] as String,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        Container(
                                          width: 7,
                                          height: 7,
                                          decoration: BoxDecoration(
                                            color: activeChat['online'] == true
                                                ? const Color(0xFF10B981)
                                                : const Color(0xFF94A3B8),
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          activeChat['online'] == true ? 'En ligne sur le campus' : 'Dernière connexion récente',
                                          style: TextStyle(
                                            color: activeChat['online'] == true
                                                ? const Color(0xFF34D399)
                                                : const Color(0xFF94A3B8),
                                            fontSize: 11,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.videocam_rounded, color: Color(0xFF38BDF8)),
                                tooltip: 'Lancer une visio amphi avec ce canal',
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Lancement du pont visio P2P local pour ce groupe...'),
                                      backgroundColor: Color(0xFF0D9488),
                                    ),
                                  );
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.info_outline_rounded, color: Color(0xFF94A3B8)),
                                tooltip: 'Détails du canal / participants',
                                onPressed: () {},
                              ),
                            ],
                          ),
                        ),

                        // Liste des messages
                        Expanded(
                          child: ListView.builder(
                            controller: _scrollController,
                            padding: const EdgeInsets.all(20),
                            itemCount: messages.length,
                            itemBuilder: (context, index) {
                              final msg = messages[index];
                              final isMe = msg['isMe'] as bool;

                              return Align(
                                alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                                child: Container(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  constraints: BoxConstraints(
                                    maxWidth: MediaQuery.of(context).size.width * 0.45,
                                  ),
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    gradient: isMe
                                        ? const LinearGradient(
                                            colors: [Color(0xFF1E3A8A), Color(0xFF0D9488)],
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                          )
                                        : null,
                                    color: !isMe ? const Color(0xFF1E293B) : null,
                                    borderRadius: BorderRadius.only(
                                      topLeft: const Radius.circular(18),
                                      topRight: const Radius.circular(18),
                                      bottomLeft: Radius.circular(isMe ? 18 : 4),
                                      bottomRight: Radius.circular(isMe ? 4 : 18),
                                    ),
                                    border: Border.all(
                                      color: isMe ? Colors.white.withValues(alpha: 0.15) : const Color(0xFF334155),
                                    ),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      if (!isMe)
                                        Text(
                                          msg['sender'] as String,
                                          style: const TextStyle(
                                            color: Color(0xFF38BDF8),
                                            fontWeight: FontWeight.bold,
                                            fontSize: 11,
                                          ),
                                        ),
                                      if (!isMe) const SizedBox(height: 4),
                                      Text(
                                        msg['text'] as String,
                                        style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
                                      ),
                                      if (msg['attachment'] != null) ...[
                                        const SizedBox(height: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF0F172A).withValues(alpha: 0.7),
                                            borderRadius: BorderRadius.circular(10),
                                            border: Border.all(color: Colors.white24),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(Icons.attach_file_rounded, color: Color(0xFFF59E0B), size: 14),
                                              const SizedBox(width: 6),
                                              Text(
                                                msg['attachment'] as String,
                                                style: const TextStyle(color: Color(0xFFBAE6FD), fontSize: 11, fontWeight: FontWeight.bold),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                      const SizedBox(height: 4),
                                      Align(
                                        alignment: Alignment.bottomRight,
                                        child: Text(
                                          msg['time'] as String,
                                          style: TextStyle(
                                            color: Colors.white.withValues(alpha: 0.6),
                                            fontSize: 9.5,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),

                        // Compositeur de message
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: const BoxDecoration(
                            color: Color(0xFF0F172A),
                            border: Border(top: BorderSide(color: Color(0xFF1E293B))),
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.attach_file_rounded, color: Color(0xFF94A3B8)),
                                tooltip: 'Joindre un document de cours ou PDF',
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Sélection de document académique...'),
                                      backgroundColor: Color(0xFF1E3A8A),
                                    ),
                                  );
                                },
                              ),
                              Expanded(
                                child: TextField(
                                  controller: _messageController,
                                  style: const TextStyle(color: Colors.white, fontSize: 13),
                                  onSubmitted: (_) => _sendMessage(),
                                  decoration: InputDecoration(
                                    hintText: 'Écrire un message pour ${activeChat['name']}...',
                                    hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 12),
                                    filled: true,
                                    fillColor: const Color(0xFF1E293B),
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(20),
                                      borderSide: const BorderSide(color: Color(0xFF334155)),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(20),
                                      borderSide: const BorderSide(color: Color(0xFF0D9488)),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              InkWell(
                                onTap: _sendMessage,
                                borderRadius: BorderRadius.circular(16),
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: const BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [Color(0xFF0D9488), Color(0xFF2563EB)],
                                    ),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
