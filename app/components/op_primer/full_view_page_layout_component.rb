# frozen_string_literal: true

#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) the OpenProject GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See COPYRIGHT and LICENSE files for more details.
#++

module OpPrimer
  class FullViewPageLayoutComponent < ViewComponent::Base
    class Tab < ViewComponent::Base
      attr_reader :name, :href, :active, :primary

      def initialize(name:, href:, active: false, primary: false)
        @name = name.to_s
        @href   = href
        @active = active
        @primary = primary
      end

      def call
        content
      end
    end

    renders_one  :header
    renders_one  :primary_tab, OpPrimer::FullViewPageLayoutComponent::Tab
    renders_many :tabs, OpPrimer::FullViewPageLayoutComponent::Tab

    def all_tabs
      return tabs unless mobile? && primary_tab

      [primary_tab, *tabs]
    end

    def active_tab
      all_tabs.find(&:active) || primary_tab || tabs.first
    end

    def right_tab
      return active_tab if mobile?

      # Special case when the left side is marked as active tab
      if active_tab == primary_tab
        tabs.first
      else
        active_tab
      end
    end

    def render_primary_tab_alone?
      !mobile?
    end

    def mobile?
      helpers.browser.device.mobile?
    end
  end
end
